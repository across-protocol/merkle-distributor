import { constants } from "ethers";

import { recipientsFileSchema } from "./schemas";

describe("schemas", () => {
  describe("recipientsFileSchema", () => {
    const valid = {
      chainId: 1,
      rewardToken: constants.AddressZero,
      windowIndex: 0,
      rewardsToDeposit: "10",
      recipients: [
        {
          amount: "10",
          account: constants.AddressZero,
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

    test("throw for invalid BigNumberish", () => {
      expect(() =>
        recipientsFileSchema.validateSync({
          ...valid,
          rewardsToDeposit: "INVALID"
        })
      ).toThrowError();
    });
  });
});
