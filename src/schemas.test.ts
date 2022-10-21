import { constants } from "ethers";

import {
  recipientsFileSchema,
  treeFileSchema,
  publishedTreeFileSchema
} from "./schemas";

const nonZeroAddress = "0x40153DdFAd90C49dbE3F5c9F96f2a5B25ec67461";
const bytes32Hex =
  "0x22d3a95c82f748d96d4bd698bf1177d0ce98aab22f9a8410a870544f465cb8c8";
const cidV0 = "QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n";
const cidV1 = "bagaaierasords4njcts6vs7qvdjfcvgnume4hqohf65zsfguprqphs3icwea";
const validRecipient = {
  amount: "10",
  account: nonZeroAddress,
  metadata: {
    amountBreakdown: {
      welcomeTravelerRewards: "10"
    }
  }
};
const validRecipientWithProof = {
  ...validRecipient,
  windowIndex: 0,
  accountIndex: 0,
  proof: [bytes32Hex]
};
const validRecipientsFile = {
  chainId: 1,
  rewardToken: nonZeroAddress,
  windowIndex: 0,
  rewardsToDeposit: "10",
  recipients: [validRecipient]
};
const validTreeFile = {
  ...validRecipientsFile,
  merkleRoot: bytes32Hex,
  recipientsWithProofs: [validRecipientWithProof]
};

describe("schemas", () => {
  describe("recipientsFileSchema", () => {
    test("return true for valid object", () => {
      expect(
        recipientsFileSchema.validateSync(validRecipientsFile)
      ).toBeTruthy();
    });

    test("throw for object with missing fields", () => {
      expect(() => recipientsFileSchema.validateSync({})).toThrowError();
    });

    test("throw for invalid address", () => {
      expect(() =>
        recipientsFileSchema.validateSync({
          ...validRecipientsFile,
          rewardToken: "INVALID"
        })
      ).toThrowError();
    });

    test("throw for zero address", () => {
      expect(() =>
        recipientsFileSchema.validateSync({
          ...validRecipientsFile,
          rewardToken: constants.AddressZero
        })
      ).toThrowError();
    });

    test("throw for invalid BigNumberish", () => {
      expect(() =>
        recipientsFileSchema.validateSync({
          ...validRecipientsFile,
          rewardsToDeposit: "INVALID"
        })
      ).toThrowError();
    });

    test("throw for negative BigNumberish", () => {
      expect(() =>
        recipientsFileSchema.validateSync({
          ...validRecipientsFile,
          rewardsToDeposit: "-10"
        })
      ).toThrowError();
    });

    test("throw for invalid scientific notation", () => {
      expect(() =>
        recipientsFileSchema.validateSync({
          ...validRecipientsFile,
          rewardsToDeposit: "1e+18"
        })
      ).toThrowError();
    });
  });

  describe("treeFileSchema", () => {
    test("return true for valid object", () => {
      expect(treeFileSchema.validateSync(validTreeFile));
    });

    test("throw for invalid root", () => {
      expect(() =>
        treeFileSchema.validateSync({
          ...validTreeFile,
          merkleRoot: "invalid"
        })
      ).toThrowError();
    });

    test("throw for invalid proof", () => {
      expect(() =>
        treeFileSchema.validateSync({
          ...validTreeFile,
          recipientsWithProofs: [
            {
              ...validRecipientWithProof,
              proof: "invalid"
            }
          ]
        })
      ).toThrowError();
    });
  });

  describe("publishedTreeFileSchema", () => {
    test("return true for valid object with v0 CID", () => {
      expect(
        publishedTreeFileSchema.validateSync({
          ipfsHash: cidV0,
          ...validTreeFile
        })
      );
    });

    test("return true for valid object with v1 CID", () => {
      expect(
        publishedTreeFileSchema.validateSync({
          ipfsHash: cidV1,
          ...validTreeFile
        })
      );
    });

    test("throw for invalid CID", () => {
      expect(() =>
        publishedTreeFileSchema.validateSync({
          ipfsHash: "invalid",
          ...validTreeFile
        })
      ).toThrowError();
    });
  });
});
