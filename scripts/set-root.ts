import { program } from "commander";
import dotenv from "dotenv";
import { utils } from "ethers";
import {
  MerkleDistributor__factory,
  ExpandedERC20__factory,
  getDeployedAddress
} from "@across-protocol/contracts-v2";

import { parseInputFile } from "../src/fs-utils";
import {
  assertAndGetOwnerWallet,
  checkRecipientAmountsAndDuplicates,
  ensureApprovedTokens,
  checkMerkleDistributor
} from "../src/validation";
import { publishedTreeFileSchema } from "../src/schemas";

dotenv.config();

program
  .requiredOption(
    "-i, --input <path>",
    "input JSON file location containing output of 'yarn publish-tree'"
  )
  .option(
    "-a, --address <address>",
    "contract address of MerkleDistributor contract"
  )
  .option("-w, --wait <blocks>", "number of confirmations to wait", "1")
  .parse(process.argv);

async function main() {
  const options = program.opts();

  console.log(`Setting root/window for ${options.input}...`);

  const rawInputFile = parseInputFile(options.input);
  const inputFile = {
    ...rawInputFile,
    // We transform this to an array because yup doesn't have good support for
    // schemas with dynamic keys and type inference
    recipientsWithProofs: Object.values(rawInputFile.recipientsWithProofs)
  };

  console.log("\n1. Validating input file...");
  const validInputFile = publishedTreeFileSchema.validateSync(inputFile, {
    abortEarly: false
  });
  const merkleDistributorAddress = utils.isAddress(options.address)
    ? (options.address as string)
    : getDeployedAddress("MerkleDistributor", validInputFile.chainId);
  const waitBlocks = Number(options.wait);

  console.log("\n2. Checking recipient amounts and duplicates...");
  checkRecipientAmountsAndDuplicates(
    validInputFile.recipientsWithProofs,
    validInputFile.rewardsToDeposit
  );

  console.log("\n3. Checking reward token contract...");
  const ownerWallet = assertAndGetOwnerWallet();

  const rewardToken = ExpandedERC20__factory.connect(
    validInputFile.rewardToken,
    ownerWallet
  );
  await ensureApprovedTokens(
    rewardToken,
    merkleDistributorAddress,
    validInputFile,
    waitBlocks
  );

  console.log("\n4. Checking merkle distributor contract...");
  const merkleDistributor = MerkleDistributor__factory.connect(
    merkleDistributorAddress,
    ownerWallet
  );
  await checkMerkleDistributor(merkleDistributor, validInputFile);

  const setWindowArgs: [string, string, string, string] = [
    validInputFile.rewardsToDeposit,
    validInputFile.rewardToken,
    validInputFile.merkleRoot,
    validInputFile.ipfsHash
  ];
  console.log(
    `\n5. Setting new window at index ${validInputFile.windowIndex}...`,
    setWindowArgs
  );
  const tx = await merkleDistributor.setWindow(...setWindowArgs);
  console.log(`Tx hash: ${tx.hash}`);
  await tx.wait(waitBlocks);
  console.log(`Successfully mined`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
