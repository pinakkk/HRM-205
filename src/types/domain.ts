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

export type LeaderboardRow = Database["public"]["Views"]["leaderboard"]["Row"];
export type PointsBalance = Database["public"]["Views"]["points_balance"]["Row"];

export type Role = "employee" | "admin";
