import * as yup from "yup";
import { BigNumber, constants, utils } from "ethers";

const testIsNonZeroAddress = {
  name: "is-non-zero-address",
  message: "${path} is not a valid address",
  test: isNonZeroAddress
};

const testIsPositiveBigNumberish = {
  name: "is-big-numberish",
  message: "${path} is not BigNumberish",
  test: isPositiveBigNumberish
};

export const recipientSchema = yup.object({
  amount: yup.string().test(testIsPositiveBigNumberish).defined(),
  account: yup.string().test(testIsNonZeroAddress).defined(),
  metadata: yup
    .object({
      amountBreakdown: yup
        .object({
          welcomeTravelerRewards: yup
            .string()
            .test(testIsPositiveBigNumberish)
            .default("0"),
          earlyUserRewards: yup
            .string()
            .test(testIsPositiveBigNumberish)
            .default("0"),
          liquidityProviderRewards: yup
            .string()
            .test(testIsPositiveBigNumberish)
            .default("0"),
          communityRewards: yup
            .string()
            .test(testIsPositiveBigNumberish)
            .default("0")
        })
        .defined()
    })
    .defined()
});

export const recipientsFileSchema = yup.object({
  chainId: yup.number().integer().positive().defined(),
  rewardToken: yup.string().test(testIsNonZeroAddress).defined(),
  windowIndex: yup.number().integer().min(0).defined(),
  rewardsToDeposit: yup.string().test(testIsPositiveBigNumberish).defined(),
  recipients: yup.array().of(recipientSchema).defined()
});

function isNonZeroAddress(value?: string) {
  if (!value) {
    return false;
  }

  return utils.isAddress(value) ? value !== constants.AddressZero : false;
}

function isPositiveBigNumberish(value?: string) {
  try {
    return BigNumber.from(value).gte(0);
  } catch (error) {
    return false;
  }
}
