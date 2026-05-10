import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["users"]["Row"];
export type LedgerRow = Database["public"]["Tables"]["rewards_ledger"]["Row"];
export type Feedback = Database["public"]["Tables"]["feedback"]["Row"];
export type Badge = Database["public"]["Tables"]["badges"]["Row"];
export type UserBadge = Database["public"]["Tables"]["user_badges"]["Row"];
export type CatalogItem = Database["public"]["Tables"]["catalog_items"]["Row"];
export type Redemption = Database["public"]["Tables"]["redemptions"]["Row"];
export type AllocationCycle = Database["public"]["Tables"]["allocation_cycles"]["Row"];
export type AuditFinding = Database["public"]["Tables"]["audit_findings"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"];
export type Leave = Database["public"]["Tables"]["leaves"]["Row"];
export type RewardRule = Database["public"]["Tables"]["reward_rules"]["Row"];
export type EmployeeOfMonth = Database["public"]["Tables"]["employee_of_month"]["Row"];

export type LeaderboardRow = Database["public"]["Views"]["leaderboard"]["Row"];
export type PointsBalance = Database["public"]["Views"]["points_balance"]["Row"];

export type Role = "employee" | "admin";

export type GamificationLevel = {
  tier: "Beginner" | "Performer" | "Achiever" | "Expert" | "Champion";
  min: number;
  max: number;
  next: number | null;
};
