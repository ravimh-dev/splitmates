export interface SettlementCreateReq {
  group_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number; // in paise
}
