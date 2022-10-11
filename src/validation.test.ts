import { checkRecipientAmountsAndDuplicates } from "./validation";

describe("validation", () => {
  describe("#checkRecipientAmountsAndDuplicates()", () => {
    const recipient1 = {
      amount: "10",
      account: "0x00b591bc2b682a0b30dd72bac9406bfa13e5d3cd",
      metadata: {
        amountBreakdown: {
          welcomeTravelerRewards: "10",
          earlyUserRewards: "0",
          liquidityProviderRewards: "0",
          communityRewards: "0"
        }
      }
    };
    const recipient2 = {
      amount: "40",
      account: "0x00e4846e2971bb2b29cec7c9efc8fa686ae21342",
      metadata: {
        amountBreakdown: {
          welcomeTravelerRewards: "10",
          earlyUserRewards: "10",
          liquidityProviderRewards: "10",
          communityRewards: "10"
        }
      }
    };

    test("do not throw for distinct recipients and correct sum", () => {
      expect(() =>
        checkRecipientAmountsAndDuplicates(
          [recipient1, recipient2],
          Number(recipient1.amount) + Number(recipient2.amount)
        )
      ).not.toThrow();
    });

    test("throw for incorrect recipient amount", () => {
      expect(() =>
        checkRecipientAmountsAndDuplicates(
          [
            {
              ...recipient1,
              amount: "0"
            }
          ],
          recipient1.amount
        )
      ).toThrow(/breakdown sum/);
    });

    test("throw for incorrect total amount", () => {
      expect(() =>
        checkRecipientAmountsAndDuplicates([recipient1], "0")
      ).toThrow(/rewards deposit/);
    });

    test("throw for duplicates", () => {
      expect(() =>
        checkRecipientAmountsAndDuplicates(
          [recipient1, recipient1],
          2 * Number(recipient1.amount)
        )
      ).toThrow(/duplicate/);
    });
  });
});
