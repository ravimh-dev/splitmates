export type ActivityType =
  | "group_created"
  | "member_joined"
  | "member_removed"
  | "expense_added"
  | "expense_updated"
  | "expense_deleted"
  | "settlement_created"
  | "settlement_completed";

export interface ActivityRow {
  id: string;
  group_id: string;
  actor_id: string;
  type: ActivityType;
  metadata: any;
  created_at: string;
}
