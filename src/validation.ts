import { BigNumber, BigNumberish, utils } from "ethers";
import { InferType } from "yup";
import assert from "assert";

import { recipientSchema } from "./schemas";

type Recipient = InferType<typeof recipientSchema>;

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
    communityRewards
  } = recipient.metadata.amountBreakdown;

  const amountBreakdownSum = BigNumber.from(welcomeTravelerRewards)
    .add(earlyUserRewards)
    .add(liquidityProviderRewards)
    .add(communityRewards);

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
