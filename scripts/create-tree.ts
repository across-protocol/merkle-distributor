import { program } from "commander";
import fs from "fs";
import { utils } from "ethers";
import * as sdk from "@across-protocol/sdk-v2";

import { recipientsFileSchema } from "../src/schemas";
import { checkRecipientAmountsAndDuplicates } from "../src/validation";

const { MerkleDistributor } = sdk.merkleDistributor;

program
  .requiredOption(
    "-i, --input <path>",
    "input JSON file location containing recipients"
  )
  .parse(process.argv);

async function main() {
  const options = program.opts();

  console.log(`Creating a merkle tree and proofs for ${options.input}...`);

  if (!fs.existsSync(options.input)) {
    throw new Error(`File ${options.input} does not exist`);
  }

  const inputFile = JSON.parse(
    fs.readFileSync(options.input, { encoding: "utf8" })
  );

  console.log("\n1. Validating input file...");
  const validInputFile = recipientsFileSchema.validateSync(inputFile, {
    abortEarly: false
  });

  console.log("\n2. Checking recipient amounts and duplicates...");
  checkRecipientAmountsAndDuplicates(
    validInputFile.recipients,
    validInputFile.rewardsToDeposit
  );

  console.log("\n3. Creating tree...");
  const { recipientsWithProofs, merkleRoot } =
    MerkleDistributor.createMerkleDistributionProofs(
      validInputFile.recipients.map((r, i) => ({
        ...r,
        accountIndex: i,
        account: utils.getAddress(r.account)
      })),
      validInputFile.windowIndex
    );

  const outputFilePath = `${process.cwd()}/output.json`;
  const outputFile = {
    chainId: validInputFile.chainId,
    rewardToken: validInputFile.rewardToken,
    windowIndex: validInputFile.windowIndex,
    rewardsToDeposit: validInputFile.rewardsToDeposit,
    merkleRoot,
    recipientsWithProofs
  };
  fs.writeFileSync(outputFilePath, JSON.stringify(outputFile, null, 2));
  console.log(`\n4. Saved to ${outputFilePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
