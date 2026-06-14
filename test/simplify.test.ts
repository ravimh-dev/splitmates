import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/modules/balances/balances.model", () => ({
  getGroupBalances: vi.fn(),
}));

import { getGroupBalances } from "../src/modules/balances/balances.model";
import { simplifyGroupBalances } from "../src/modules/settlements/simplify";

describe("simplifyGroupBalances", () => {
  beforeEach(() => {
    (getGroupBalances as any).mockReset();
  });

  it("produces minimal transfers for simple case", async () => {
    (getGroupBalances as any).mockResolvedValue([
      { user_id: "A", total_paid: 1000, total_owed: 0, net_balance: 1000 },
      { user_id: "B", total_paid: 0, total_owed: 500, net_balance: -500 },
      { user_id: "C", total_paid: 0, total_owed: 500, net_balance: -500 },
    ]);

    const transfers = await simplifyGroupBalances("group1");
    expect(transfers).toHaveLength(2);
    expect(transfers).toContainEqual({ from: "B", to: "A", amount: 500 });
    expect(transfers).toContainEqual({ from: "C", to: "A", amount: 500 });
  });
});
