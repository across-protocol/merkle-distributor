import { program } from "commander";
import dotenv from "dotenv";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

import { parseInputFile, writeToOutput } from "../src/fs-utils";
import {
  assertAndGetPinataEnvVars,
  assertAndGetScraperEnvVars,
  checkRecipientAmountsAndDuplicates
} from "../src/validation";
import { treeFileSchema } from "../src/schemas";

dotenv.config();

program
  .requiredOption(
    "-i, --input <path>",
    "input JSON file location containing output of 'yarn create-tree'"
  )
  .option(
    "-ss, --skip-scraper",
    "optional flag whether to skip scraper api upload",
    true // TODO: set to false if Scraper API endpoint ready
  )
  .parse(process.argv);

async function main() {
  const options = program.opts();

  console.log(`Publishing ${options.input} to IPFS and Scraper API...`);

  const rawInputFile = parseInputFile(options.input);
  const inputFile = {
    ...rawInputFile,
    // We transform this to an array because yup doesn't have good support for
    // schemas with dynamic keys and type inference
    recipientsWithProofs: Object.values(rawInputFile.recipientsWithProofs)
  };
  const inputFileName = path.basename(options.input, ".json");

  console.log("\n1. Validating input file...");
  const validInputFile = treeFileSchema.validateSync(inputFile, {
    abortEarly: false
  });

  console.log("\n2. Checking recipient amounts and duplicates...");
  checkRecipientAmountsAndDuplicates(
    validInputFile.recipientsWithProofs,
    validInputFile.rewardsToDeposit
  );

  console.log("\n3. Store on IPFS...");
  const { pinataJwt } = assertAndGetPinataEnvVars();
  const { data } = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
      pinataMetadata: {
        name: inputFileName,
        keyvalues: {
          windowIndex: validInputFile.windowIndex
        }
      },
      pinataContent: validInputFile
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pinataJwt}`
      }
    }
  );

  const outputFileName = `${inputFileName}_published.json`;
  const outputFilePath = writeToOutput(outputFileName, {
    ipfsHash: data.IpfsHash,
    ...rawInputFile
  });
  console.log(`\n4. Saved to ${outputFilePath}`);

  console.log("\n5. Store on Scraper API...");
  if (options.skipScraper) {
    console.log("skipped");
  } else {
    // The Scraper API uses Multer which requires the file upload via `FormData`
    const form = new FormData();
    form.append("file", fs.createReadStream(outputFilePath));
    const { scraperApiJwt, scraperApiUrl } = assertAndGetScraperEnvVars();
    await axios.post(
      `${scraperApiUrl}/upload/merkle-distributor-recipients`,
      form,
      {
        headers: {
          Authorization: `Bearer ${scraperApiJwt}`,
          ...form.getHeaders()
        }
      }
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
