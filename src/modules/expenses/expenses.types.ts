export type SplitType = "EQUAL" | "EXACT" | "PERCENTAGE" | "SHARE";

export interface ExpenseCreateReq {
  group_id: string;
  paid_by: string;
  title?: string;
  description?: string;
  amount: number; // in paise
  currency?: string;
  split_type: SplitType;
  splits: Array<{
    user_id: string;
    amount?: number;
    percentage?: number;
    shares?: number;
  }>;
}
