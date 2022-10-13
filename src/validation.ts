import { BigNumber, BigNumberish, utils } from "ethers";
import { InferType } from "yup";

import { recipientSchema } from "./schemas";

type Recipient = InferType<typeof recipientSchema>;

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
