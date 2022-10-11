import * as yup from "yup";
import * as ethers from "ethers";

const testIsAddress = {
  name: "is-address",
  message: "${path} is not an address",
  test: isAddress
};

const testIsBigNumberish = {
  name: "is-big-numberish",
  message: "${path} is not BigNumberish",
  test: isBigNumberish
};

const recipientSchema = yup.object({
  amount: yup.string().test(testIsBigNumberish).defined(),
  account: yup.string().test(testIsAddress).defined(),
  metadata: yup
    .object({
      amountBreakdown: yup
        .object({
          welcomeTravelerRewards: yup
            .string()
            .test(testIsBigNumberish)
            .default("0"),
          earlyUserRewards: yup.string().test(testIsBigNumberish).default("0"),
          liquidityProviderRewards: yup
            .string()
            .test(testIsBigNumberish)
            .default("0"),
          communityRewards: yup.string().test(testIsBigNumberish).default("0")
        })
        .defined()
    })
    .defined()
});

export const recipientsFileSchema = yup.object({
  chainId: yup.number().defined(),
  rewardToken: yup.string().test(testIsAddress).defined(),
  windowIndex: yup.number().integer().defined(),
  rewardsToDeposit: yup.string().test(testIsBigNumberish).defined(),
  recipients: yup.array().of(recipientSchema).defined()
});

function isAddress(value?: string) {
  return value ? ethers.utils.isAddress(value) : false;
}

function isBigNumberish(value?: string) {
  try {
    ethers.BigNumber.from(value);
    return true;
  } catch (error) {
    return false;
  }
}
