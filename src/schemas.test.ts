import { constants } from "ethers";

import { recipientsFileSchema } from "./schemas";

const nonZeroAddress = "0x40153DdFAd90C49dbE3F5c9F96f2a5B25ec67461";

describe("schemas", () => {
  describe("recipientsFileSchema", () => {
    const valid = {
      chainId: 1,
      rewardToken: nonZeroAddress,
      windowIndex: 0,
      rewardsToDeposit: "10",
      recipients: [
        {
          amount: "10",
          account: nonZeroAddress,
          metadata: {
            amountBreakdown: {
              welcomeTravelerRewards: "10"
            }
          }
        }
      ]
    };

    test("return true for valid object", () => {
      expect(recipientsFileSchema.validateSync(valid)).toBeTruthy();
    });

    test("throw for object with missing fields", () => {
      expect(() => recipientsFileSchema.validateSync({})).toThrowError();
    });

    test("throw for invalid address", () => {
      expect(() =>
        recipientsFileSchema.validateSync({
          ...valid,
          rewardToken: "INVALID"
        })
      ).toThrowError();
    });

    test("throw for zero address", () => {
      expect(() =>
        recipientsFileSchema.validateSync({
          ...valid,
          rewardToken: constants.AddressZero
        })
      ).toThrowError();
    });

    test("throw for invalid BigNumberish", () => {
      expect(() =>
        recipientsFileSchema.validateSync({
          ...valid,
          rewardsToDeposit: "INVALID"
        })
      ).toThrowError();
    });

    test("throw for negative BigNumberish", () => {
      expect(() =>
        recipientsFileSchema.validateSync({
          ...valid,
          rewardsToDeposit: "-10"
        })
      ).toThrowError();
    });

    test("throw for invalid scientific notation", () => {
      expect(() =>
        recipientsFileSchema.validateSync({
          ...valid,
          rewardsToDeposit: "1e+18"
        })
      ).toThrowError();
    });
  });
});
