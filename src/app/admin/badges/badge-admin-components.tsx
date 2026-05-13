"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Plus,
  Users,
  Search,
  Edit3,
  Trash2,
  ShieldCheck,
  Zap,
  Target,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/browser";
import { toasts } from "@/components/ui/Toaster";

type EmployeeOption = { id: string; full_name: string; email: string };
type BadgeOption = { id: string; name: string; rarity: string | null };
type Rarity = "bronze" | "silver" | "gold" | "platinum";

function makeBadgeCode(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `badge-${Date.now().toString(36)}`;
}

export function CreateBadgeForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState("");
  const [rarity, setRarity] = useState<Rarity>("bronze");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const rarities: Rarity[] = ["bronze", "silver", "gold", "platinum"];

  async function createBadge() {
    const trimmed = name.trim();
    if (!trimmed) {
      toasts.error("Badge name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const code = makeBadgeCode(trimmed);
      const insert = {
        code,
        name: trimmed,
        description: description.trim() || null,
        rarity,
      };

      let { error } = await supabase.from("badges").insert(insert);

      // If code collides, retry once with a suffix.
      if (error && (error.message ?? "").toLowerCase().includes("duplicate")) {
        const retry = { ...insert, code: `${code}-${Date.now().toString(36)}` };
        ({ error } = await supabase.from("badges").insert(retry));
      }

      if (error) throw error;

      toasts.success("Badge created.");
      setName("");
      setDescription("");
      setRarity("bronze");
      router.refresh();
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "Failed to create badge");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Create New Badge</h3>
          <p className="text-xs text-neutral-500">Define a new achievement for the platform</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-neutral-400 uppercase mb-1.5 block">Badge Name</label>
          <input 
            type="text" 
            placeholder="e.g. Early Bird, Top Innovator" 
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-neutral-400 uppercase mb-1.5 block">Rarity Level</label>
          <div className="grid grid-cols-4 gap-2">
            {rarities.map((r) => (
              <button
                key={r}
                onClick={() => setRarity(r)}
                className={cn(
                  "rounded-lg py-2 text-[10px] font-bold uppercase transition-all border",
                  rarity === r 
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-md" 
                    : "bg-white text-neutral-500 border-neutral-100 hover:border-neutral-200"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-neutral-400 uppercase mb-1.5 block">Description</label>
          <textarea 
            className="w-full h-24 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            placeholder="What is this badge awarded for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button
          type="button"
          disabled={submitting}
          onClick={createBadge}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {submitting ? "Creating…" : "Create Badge"}
        </button>
      </div>
    </div>
  );
}

export function AssignAchievementForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [employee, setEmployee] = useState("");
  const [badge, setBadge] = useState("");
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [badges, setBadges] = useState<BadgeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [{ data: emp, error: empErr }, { data: b, error: bErr }] = await Promise.all([
        supabase
          .from("users")
          .select("id, full_name, email")
          .eq("role", "employee")
          .order("full_name"),
        supabase.from("badges").select("id, name, rarity").order("created_at", { ascending: false }),
      ]);
      if (empErr) throw empErr;
      if (bErr) throw bErr;
      setEmployees((emp ?? []) as EmployeeOption[]);
      setBadges((b ?? []) as BadgeOption[]);
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-badges-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "badges" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function assign() {
    if (!employee) {
      toasts.error("Select an employee.");
      return;
    }
    if (!badge) {
      toasts.error("Choose a badge.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const awardedBy = userData.user?.id ?? null;
      const badgeName = badges.find((b) => b.id === badge)?.name ?? "Badge";

      const { error: ubErr } = await supabase.from("user_badges").insert({
        user_id: employee,
        badge_id: badge,
      });
      if (ubErr) throw ubErr;

      // Also log into rewards ledger so it appears on the employee dashboard.
      const { error: ledErr } = await supabase.from("rewards_ledger").insert({
        user_id: employee,
        kind: "badge",
        amount: 0,
        reason: badgeName,
        source: "manual",
        awarded_by: awardedBy,
      });
      if (ledErr) throw ledErr;

      toasts.success("Achievement assigned.");
      setEmployee("");
      setBadge("");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to assign badge";
      if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique")) {
        toasts.error("That employee already has this badge.");
      } else {
        toasts.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Assign Achievement</h3>
          <p className="text-xs text-neutral-500">Manually award a badge to an employee</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
          <Users className="h-5 w-5" />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-neutral-400 uppercase mb-1.5 block">Employee</label>
          <select 
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            disabled={loading}
          >
            <option value="">Select an employee...</option>
            {employees.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-neutral-400 uppercase mb-1.5 block">Achievement Badge</label>
          <select 
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            disabled={loading}
          >
            <option value="">Choose a badge...</option>
            {badges.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={assign}
          disabled={loading || submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-bold text-white hover:bg-neutral-800 transition-all disabled:opacity-60"
        >
          <Award className="h-4 w-4" />
          {submitting ? "Assigning…" : "Assign Achievement"}
        </button>
      </div>
    </div>
  );
}

export function BadgeCriteriaSettings() {
  const criteria = [
    { id: 1, name: "Points Milestone", rule: "Earn 1000 points", badge: "Gold Member", active: true },
    { id: 2, name: "Streak", rule: "10 days check-in", badge: "Consistent", active: false },
    { id: 3, name: "Peer Praise", rule: "Receive 5 kudos", badge: "Team Player", active: true },
  ];

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Criteria Settings</h3>
          <p className="text-xs text-neutral-500">Rules for automated badge awarding</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
          <Target className="h-5 w-5" />
        </div>
      </div>
      <div className="space-y-3">
        {criteria.map((c) => (
          <div key={c.id} className="group flex items-center justify-between rounded-xl border border-neutral-50 p-4 hover:border-red-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900">{c.name}</p>
                <p className="text-[10px] text-neutral-500">{c.rule} → {c.badge}</p>
              </div>
            </div>
            <div className={cn(
              "h-5 w-8 rounded-full relative cursor-pointer transition-colors",
              c.active ? "bg-emerald-500" : "bg-neutral-200"
            )}>
              <div className={cn(
                "absolute top-1 h-3 w-3 rounded-full bg-white shadow-sm transition-all",
                c.active ? "right-1" : "left-1"
              )}></div>
            </div>
          </div>
        ))}
        <button className="mt-4 w-full rounded-xl border border-dashed border-neutral-200 py-2.5 text-[10px] font-bold text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-all">
          Add Custom Rule
        </button>
      </div>
    </div>
  );
}

export function BadgeInventory() {
  const badges = [
    { name: "Top Innovator", rarity: "platinum", icon: <Sparkles className="h-4 w-4" />, count: 12 },
    { name: "Early Bird", rarity: "silver", icon: <Zap className="h-4 w-4" />, count: 45 },
    { name: "Team Player", rarity: "gold", icon: <Users className="h-4 w-4" />, count: 28 },
    { name: "Reliable", rarity: "bronze", icon: <ShieldCheck className="h-4 w-4" />, count: 89 },
  ];

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-50 p-6">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Badge Inventory</h3>
          <p className="text-xs text-neutral-500">Monitor all achievements across the platform</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Filter badges..." 
              className="h-9 w-48 rounded-lg border border-neutral-200 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors">
            View Performance Report
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-px bg-neutral-50 sm:grid-cols-2">
        {badges.map((badge, i) => (
          <div key={i} className="flex items-center justify-between bg-white p-6 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center",
                badge.rarity === "platinum" ? "bg-indigo-50 text-indigo-600" :
                badge.rarity === "gold" ? "bg-amber-50 text-amber-600" :
                badge.rarity === "silver" ? "bg-slate-50 text-slate-600" : "bg-orange-50 text-orange-600"
              )}>
                {badge.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">{badge.name}</h4>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-bold uppercase",
                    badge.rarity === "platinum" ? "text-indigo-600" :
                    badge.rarity === "gold" ? "text-amber-600" :
                    badge.rarity === "silver" ? "text-slate-600" : "text-orange-600"
                  )}>
                    {badge.rarity}
                  </span>
                  <span className="text-[10px] text-neutral-300">•</span>
                  <span className="text-[10px] text-neutral-400">{badge.count} Awarded</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-all">
                <Edit3 className="h-4 w-4" />
              </button>
              <button className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition-all">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
