import { describe, it, expect } from "vitest";
import { createExpenseSchema } from "../src/modules/expenses/expenses.validation";

describe("createExpenseSchema", () => {
  it("accepts valid equal split payload", () => {
    const payload = {
      group_id: "11111111-1111-1111-1111-111111111111",
      paid_by: "22222222-2222-2222-2222-222222222222",
      amount: 1000,
      split_type: "EQUAL",
      splits: [
        { user_id: "22222222-2222-2222-2222-222222222222" },
        { user_id: "33333333-3333-3333-3333-333333333333" },
      ],
    };
    const parsed = createExpenseSchema.parse(payload);
    expect(parsed).toBeTruthy();
  });

  it("rejects negative amount", () => {
    const payload = {
      group_id: "11111111-1111-1111-1111-111111111111",
      paid_by: "22222222-2222-2222-2222-222222222222",
      amount: -1000,
      split_type: "EQUAL",
      splits: [{ user_id: "22222222-2222-2222-2222-222222222222" }],
    };
    expect(() => createExpenseSchema.parse(payload)).toThrow();
  });
});

it("validates EXACT split sums", () => {
  const payload = {
    group_id: "11111111-1111-1111-1111-111111111111",
    paid_by: "22222222-2222-2222-2222-222222222222",
    amount: 1000,
    split_type: "EXACT",
    splits: [
      { user_id: "22222222-2222-2222-2222-222222222222", amount: 400 },
      { user_id: "33333333-3333-3333-3333-333333333333", amount: 600 },
    ],
  };
  expect(() => createExpenseSchema.parse(payload)).not.toThrow();
});

it("rejects wrong PERCENTAGE sum", () => {
  const payload = {
    group_id: "11111111-1111-1111-1111-111111111111",
    paid_by: "22222222-2222-2222-2222-222222222222",
    amount: 1000,
    split_type: "PERCENTAGE",
    splits: [
      { user_id: "22222222-2222-2222-2222-222222222222", percentage: 60 },
      { user_id: "33333333-3333-3333-3333-333333333333", percentage: 30 },
    ],
  };
  expect(() => createExpenseSchema.parse(payload)).toThrow();
});
