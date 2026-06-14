import { getGroupBalances } from "../balances/balances.model";

export type Transfer = { from: string; to: string; amount: number };

/**
 * Greedy simplification algorithm:
 * - Fetch net balances per user (positive = should receive, negative = owes)
 * - Create two lists: creditors (positive) and debtors (negative)
 * - Match largest debtor with largest creditor until balances settle
 */
export async function simplifyGroupBalances(
  groupId: string,
): Promise<Transfer[]> {
  const balances = await getGroupBalances(groupId);
  const creditors: { user_id: string; amount: number }[] = [];
  const debtors: { user_id: string; amount: number }[] = [];

  for (const b of balances) {
    const net = Number(b.net_balance || 0);
    if (net > 0) creditors.push({ user_id: b.user_id, amount: net });
    else if (net < 0) debtors.push({ user_id: b.user_id, amount: -net });
  }

  // sort descending
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amt = Math.min(debtor.amount, creditor.amount);
    if (amt <= 0) break;
    transfers.push({ from: debtor.user_id, to: creditor.user_id, amount: amt });
    debtor.amount -= amt;
    creditor.amount -= amt;
    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  return transfers;
}
