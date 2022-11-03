import {
  BigNumber,
  BigNumberish,
  utils,
  Wallet,
  constants,
  providers
} from "ethers";
import { InferType } from "yup";
import assert from "assert";
import {
  ExpandedERC20,
  AcrossMerkleDistributor
} from "@across-protocol/contracts-v2";

import { recipientSchema, publishedTreeFileSchema } from "./schemas";

type Recipient = InferType<typeof recipientSchema>;

type PublishedTreeFile = InferType<typeof publishedTreeFileSchema>;

export function assertAndGetPinataEnvVars() {
  assert(process.env.PINATA_JWT, "Env var PINATA_JWT missing");

  return {
    pinataJwt: process.env.PINATA_JWT
  };
}

export function assertAndGetScraperEnvVars() {
  assert(process.env.SCRAPER_API_URL, "Env var SCRAPER_API_URL missing");
  assert(process.env.SCRAPER_API_JWT, "Env var SCRAPER_API_JWT missing");

  return {
    scraperApiUrl: process.env.SCRAPER_API_URL,
    scraperApiJwt: process.env.SCRAPER_API_JWT
  };
}

export function assertAndGetOwnerWallet() {
  assert(process.env.JSON_RPC_URL, "Env var JSON_RPC_URL missing");
  assert(
    process.env.OWNER_PK || process.env.OWNER_MNEMONIC,
    "Either OWNER_PK or OWNER_MNEMONIC need to be set"
  );
  const ownerWallet = process.env.OWNER_PK
    ? new Wallet(process.env.OWNER_PK)
    : Wallet.fromMnemonic(process.env.OWNER_MNEMONIC || "");

  return ownerWallet.connect(
    new providers.StaticJsonRpcProvider(process.env.JSON_RPC_URL)
  );
}

export async function ensureApprovedTokens(
  expandedERC20: ExpandedERC20,
  merkleDistributorAddress: string,
  publishedTreeFile: PublishedTreeFile,
  wait = 1
) {
  const currentAllowance = await expandedERC20.allowance(
    await expandedERC20.signer.getAddress(),
    merkleDistributorAddress
  );
  if (currentAllowance.lt(publishedTreeFile.rewardsToDeposit)) {
    console.log("Signer doesn't have enough approved tokens. Approving...");
    const tx = await expandedERC20.approve(
      merkleDistributorAddress,
      constants.MaxUint256
    );
    console.log(`Tx hash: ${tx.hash}`);
    await tx.wait(wait);
    console.log(`Successfully mined`);
  } else {
    console.log("Signer has enough approved tokens");
  }
}

export async function checkMerkleDistributor(
  merkleDistributor: AcrossMerkleDistributor,
  publishedTreeFile: PublishedTreeFile
) {
  const nextWindowIndex = await merkleDistributor.nextCreatedIndex();
  assert(
    nextWindowIndex.eq(publishedTreeFile.windowIndex),
    `On-chain windowIndex '${nextWindowIndex}' must equal windowIndex from input file '${publishedTreeFile.windowIndex}'`
  );

  // checks if transaction would fail
  await merkleDistributor.callStatic.setWindow(
    publishedTreeFile.rewardsToDeposit,
    publishedTreeFile.rewardToken,
    publishedTreeFile.merkleRoot,
    publishedTreeFile.ipfsHash
  );
}

export function checkRecipientAmountsAndDuplicates(
  recipients: Recipient[],
  totalRewardsToDeposit: BigNumberish
) {
  const checkedRecipientAddresses: Set<string> = new Set();
  let amountSum = BigNumber.from(0);

  for (const [i, recipient] of recipients.entries()) {
    checkRecipientAmount(recipient, i);
    checkRecipientUniqueness(recipient, i, checkedRecipientAddresses);

    amountSum = amountSum.add(recipient.amount);
    checkedRecipientAddresses.add(utils.getAddress(recipient.account));
  }

  if (!amountSum.eq(totalRewardsToDeposit)) {
    throw new Error(
      `Total rewards deposit ${totalRewardsToDeposit} does not equal sum of recipient amounts ${amountSum}`
    );
  }
}

function checkRecipientAmount(recipient: Recipient, index: number) {
  const {
    welcomeTravelerRewards,
    earlyUserRewards,
    liquidityProviderRewards,
    communityRewards,
    referralRewards
  } = recipient.metadata.amountBreakdown;

  const amountBreakdownSum = BigNumber.from(welcomeTravelerRewards)
    .add(earlyUserRewards)
    .add(liquidityProviderRewards)
    .add(communityRewards)
    .add(referralRewards);

  if (!amountBreakdownSum.eq(recipient.amount)) {
    throw new Error(
      `Amount ${recipient.amount} of recipient at index ${index} does not equal amount breakdown sum ${amountBreakdownSum}`
    );
  }
}

function checkRecipientUniqueness(
  recipient: Recipient,
  index: number,
  checkedRecipientAddresses: Set<string>
) {
  const recipientAddress = utils.getAddress(recipient.account);
  if (checkedRecipientAddresses.has(recipientAddress)) {
    throw new Error(
      `Recipient ${recipient.account} at index ${index} is a duplicate`
    );
  }
}
