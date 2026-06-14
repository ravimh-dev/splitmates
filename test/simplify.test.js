"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
vitest_1.vi.mock("../src/modules/balances/balances.model", () => ({
    getGroupBalances: vitest_1.vi.fn(),
}));
const balances_model_1 = require("../src/modules/balances/balances.model");
const simplify_1 = require("../src/modules/settlements/simplify");
(0, vitest_1.describe)("simplifyGroupBalances", () => {
    (0, vitest_1.beforeEach)(() => {
        balances_model_1.getGroupBalances.mockReset();
    });
    (0, vitest_1.it)("produces minimal transfers for simple case", async () => {
        balances_model_1.getGroupBalances.mockResolvedValue([
            { user_id: "A", total_paid: 1000, total_owed: 0, net_balance: 1000 },
            { user_id: "B", total_paid: 0, total_owed: 500, net_balance: -500 },
            { user_id: "C", total_paid: 0, total_owed: 500, net_balance: -500 },
        ]);
        const transfers = await (0, simplify_1.simplifyGroupBalances)("group1");
        (0, vitest_1.expect)(transfers).toHaveLength(2);
        (0, vitest_1.expect)(transfers).toContainEqual({ from: "B", to: "A", amount: 500 });
        (0, vitest_1.expect)(transfers).toContainEqual({ from: "C", to: "A", amount: 500 });
    });
});
