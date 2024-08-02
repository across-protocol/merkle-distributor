import * as yup from "yup";
import { BigNumber, constants, utils } from "ethers";
import { CID } from "multiformats/cid";

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

const testIsBytes32HexString = {
  name: "is-bytes-32-hex",
  message: "${path} is not a valid bytes32 hex string",
  test: isBytes32HexString
};

const testIsCID = {
  name: "is-ipfs-cid",
  message: "${path} is not a valid IPFS CID",
  test: isCID
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
            .default("0"),
          referralRewards: yup
            .string()
            .test(testIsPositiveBigNumberish)
            .default("0"),
          opRewards: yup
            .string()
            .test(testIsPositiveBigNumberish)
            .default("0"),
          arbRewards: yup
            .string()
            .test(testIsPositiveBigNumberish)
            .default("0")
        })
        .defined()
    })
    .defined()
});

export const recipientWithProofSchema = recipientSchema.concat(
  yup.object({
    accountIndex: yup.number().integer().min(0).defined(),
    windowIndex: yup.number().integer().min(0).defined(),
    proof: yup.array().of(yup.string().test(testIsBytes32HexString)).defined()
  })
);

const baseInputFileSchema = yup.object({
  chainId: yup.number().integer().positive().defined(),
  contractAddress: yup.string().test(testIsNonZeroAddress).defined(),
  rewardToken: yup.string().test(testIsNonZeroAddress).defined(),
  windowIndex: yup.number().integer().min(0).defined(),
  rewardsToDeposit: yup.string().test(testIsPositiveBigNumberish).defined()
});

export const recipientsFileSchema = baseInputFileSchema.concat(
  yup.object({
    recipients: yup.array().of(recipientSchema).defined()
  })
);

export const treeFileSchema = baseInputFileSchema.concat(
  yup.object({
    merkleRoot: yup.string().test(testIsBytes32HexString).defined(),
    recipientsWithProofs: yup.array().of(recipientWithProofSchema).defined()
  })
);

export const publishedTreeFileSchema = treeFileSchema.concat(
  yup.object({
    ipfsHash: yup.string().test(testIsCID).defined(),
    merkleRoot: yup.string().test(testIsBytes32HexString).defined(),
    recipientsWithProofs: yup.array().of(recipientWithProofSchema).defined()
  })
);

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

function isBytes32HexString(value?: string) {
  return utils.isHexString(value, 32);
}

function isCID(value?: string) {
  try {
    if (!value) {
      return false;
    }
    CID.parse(value);
    return true;
  } catch (error) {
    return false;
  }
}
