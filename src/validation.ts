import { BigNumber, BigNumberish, utils } from "ethers";

type Recipient = {
  amount: string;
  account: string;
  metadata: {
    amountBreakdown: {
      welcomeTravelerRewards: string;
      earlyUserRewards: string;
      liquidityProviderRewards: string;
      communityRewards: string;
    };
  };
};

export function checkRecipientAmountsAndDuplicates(
  recipients: Recipient[],
  totalRewardsToDeposit: BigNumberish
) {
  const checkedRecipients: Recipient[] = [];
  let amountSum = BigNumber.from(0);

  for (const [i, recipient] of recipients.entries()) {
    checkRecipientAmount(recipient, i);
    checkRecipientUniqueness(recipient, i, checkedRecipients);

    amountSum = amountSum.add(recipient.amount);
    checkedRecipients.push(recipient);
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
  checkedRecipients: Recipient[]
) {
  const recipientAddress = utils.getAddress(recipient.account);
  const duplicateIndex = checkedRecipients.findIndex(
    (r) => utils.getAddress(r.account) === recipientAddress
  );
  if (duplicateIndex > -1) {
    throw new Error(
      `Recipient ${recipient.account} at index ${index} is a duplicate of recipient at index ${duplicateIndex}`
    );
  }
}
