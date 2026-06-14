"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const expenses_validation_1 = require("../src/modules/expenses/expenses.validation");
(0, vitest_1.describe)("createExpenseSchema", () => {
    (0, vitest_1.it)("accepts valid equal split payload", () => {
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
        const parsed = expenses_validation_1.createExpenseSchema.parse(payload);
        (0, vitest_1.expect)(parsed).toBeTruthy();
    });
    (0, vitest_1.it)("rejects negative amount", () => {
        const payload = {
            group_id: "11111111-1111-1111-1111-111111111111",
            paid_by: "22222222-2222-2222-2222-222222222222",
            amount: -1000,
            split_type: "EQUAL",
            splits: [{ user_id: "22222222-2222-2222-2222-222222222222" }],
        };
        (0, vitest_1.expect)(() => expenses_validation_1.createExpenseSchema.parse(payload)).toThrow();
    });
});
(0, vitest_1.it)("validates EXACT split sums", () => {
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
    (0, vitest_1.expect)(() => expenses_validation_1.createExpenseSchema.parse(payload)).not.toThrow();
});
(0, vitest_1.it)("rejects wrong PERCENTAGE sum", () => {
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
    (0, vitest_1.expect)(() => expenses_validation_1.createExpenseSchema.parse(payload)).toThrow();
});
