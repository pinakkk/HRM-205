/**
 * Hand-rolled Database types matching `supabase/migrations/0001_init.sql` and
 * `0003_views.sql`. Once the migrations are pushed to Supabase, replace with:
 *
 *   pnpm db:types
 *
 * (or `npx supabase gen types typescript --project-id <ref> > src/types/database.ts`).
 *
 * Insert / Update types are written explicitly (not via Partial<Row>) because
 * @supabase/supabase-js v2 query-builder generics collapse Partial<...> to
 * `never` and break inference in pages.
 */

export type Json = string | number | boolean | null | { [k: string]: Json | undefined } | Json[];

type Role = "employee" | "admin";
type Sentiment = "positive" | "neutral" | "constructive" | "negative";
type Rarity = "bronze" | "silver" | "gold" | "platinum";
type CycleStatus = "draft" | "published" | "closed";
type LedgerKind = "points" | "bonus" | "badge" | "kudos";
type LedgerSource = "manual" | "ai_suggested" | "auto_rule" | "peer";
type RedemptionStatus = "pending" | "approved" | "rejected" | "fulfilled";

export type Database = {
  // Required by @supabase/ssr's generic constraints. Keep this in sync with
  // the value `npx supabase gen types typescript` would emit.
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: Role;
          department: string | null;
          gender: string | null;
          joined_at: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: Role;
          department?: string | null;
          gender?: string | null;
          joined_at?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: Role;
          department?: string | null;
          gender?: string | null;
          joined_at?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      attendance: {
        Row: {
          id: number;
          user_id: string;
          check_in: string;
          check_out: string | null;
          source: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          check_in?: string;
          check_out?: string | null;
          source?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          check_in?: string;
          check_out?: string | null;
          source?: string | null;
        };
        Relationships: [];
      };
      kpis: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          weight: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          weight?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          weight?: number;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      kpi_assignments: {
        Row: {
          id: number;
          user_id: string;
          kpi_id: string;
          cycle: string;
          target: number | null;
          achieved: number | null;
          evidence_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          kpi_id: string;
          cycle: string;
          target?: number | null;
          achieved?: number | null;
          evidence_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          kpi_id?: string;
          cycle?: string;
          target?: number | null;
          achieved?: number | null;
          evidence_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          id: number;
          from_user_id: string;
          to_user_id: string;
          body: string;
          sentiment: Sentiment | null;
          sentiment_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          from_user_id: string;
          to_user_id: string;
          body: string;
          sentiment?: Sentiment | null;
          sentiment_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          from_user_id?: string;
          to_user_id?: string;
          body?: string;
          sentiment?: Sentiment | null;
          sentiment_score?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      badges: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          rarity: Rarity | null;
          art_url: string | null;
          rule_json: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          rarity?: Rarity | null;
          art_url?: string | null;
          rule_json?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          rarity?: Rarity | null;
          art_url?: string | null;
          rule_json?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_badges: {
        Row: { user_id: string; badge_id: string; awarded_at: string };
        Insert: { user_id: string; badge_id: string; awarded_at?: string };
        Update: { user_id?: string; badge_id?: string; awarded_at?: string };
        Relationships: [];
      };
      allocation_cycles: {
        Row: {
          id: string;
          label: string;
          pool_amount: number;
          status: CycleStatus;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          pool_amount: number;
          status?: CycleStatus;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          pool_amount?: number;
          status?: CycleStatus;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      rewards_ledger: {
        Row: {
          id: number;
          user_id: string;
          cycle_id: string | null;
          kind: LedgerKind;
          amount: number;
          reason: string;
          source: LedgerSource;
          rationale_json: Json | null;
          awarded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          cycle_id?: string | null;
          kind: LedgerKind;
          amount: number;
          reason: string;
          source: LedgerSource;
          rationale_json?: Json | null;
          awarded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          cycle_id?: string | null;
          kind?: LedgerKind;
          amount?: number;
          reason?: string;
          source?: LedgerSource;
          rationale_json?: Json | null;
          awarded_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      catalog_items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          cost_points: number;
          stock: number | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          cost_points: number;
          stock?: number | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          cost_points?: number;
          stock?: number | null;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      redemptions: {
        Row: {
          id: number;
          user_id: string;
          item_id: string;
          points_spent: number;
          status: RedemptionStatus;
          decided_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          item_id: string;
          points_spent: number;
          status?: RedemptionStatus;
          decided_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          item_id?: string;
          points_spent?: number;
          status?: RedemptionStatus;
          decided_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: number;
          actor_id: string | null;
          action: string;
          target_table: string | null;
          target_id: string | null;
          payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          actor_id?: string | null;
          action: string;
          target_table?: string | null;
          target_id?: string | null;
          payload?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          actor_id?: string | null;
          action?: string;
          target_table?: string | null;
          target_id?: string | null;
          payload?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_findings: {
        Row: {
          id: number;
          metric: string;
          group_label: string | null;
          value: number | null;
          threshold: number | null;
          flagged: boolean | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          metric: string;
          group_label?: string | null;
          value?: number | null;
          threshold?: number | null;
          flagged?: boolean | null;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          metric?: string;
          group_label?: string | null;
          value?: number | null;
          threshold?: number | null;
          flagged?: boolean | null;
          details?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      points_balance: {
        Row: {
          user_id: string;
          balance: number;
          bonus_total: number;
          lifetime_total: number;
        };
        Relationships: [];
      };
      leaderboard: {
        Row: {
          user_id: string;
          full_name: string;
          avatar_url: string | null;
          department: string | null;
          balance: number;
          bonus_total: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      refresh_points_balance: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
