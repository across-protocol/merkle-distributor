import { program } from "commander";
import { utils } from "ethers";
import * as sdk from "@across-protocol/sdk-v2";

import { parseInputFile, writeToOutput } from "../src/fs-utils";
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

  const inputFile = parseInputFile(options.input);

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

  const outputFileContent = {
    chainId: validInputFile.chainId,
    contractAddress: validInputFile.contractAddress,
    rewardToken: validInputFile.rewardToken,
    windowIndex: validInputFile.windowIndex,
    rewardsToDeposit: validInputFile.rewardsToDeposit,
    merkleRoot,
    recipientsWithProofs
  };
  const outputFilePath = writeToOutput(
    `${Date.now()}-${validInputFile.windowIndex}-tree.json`,
    outputFileContent
  );
  console.log(`\n4. Saved to ${outputFilePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
