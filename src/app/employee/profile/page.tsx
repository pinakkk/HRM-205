import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { levelFromPoints, progressToNext } from "@/lib/gamification";
import { ProfileForm } from "./form";
import { Mail, Briefcase, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const me = await requireUser();
  const supabase = await createClient();
  const { data: balance } = await supabase
    .from("points_balance")
    .select("balance, lifetime_total, bonus_total")
    .eq("user_id", me.profile.id)
    .maybeSingle();

  const lifetime = Number(balance?.lifetime_total ?? 0);
  const level = levelFromPoints(lifetime);
  const progress = Math.round(progressToNext(lifetime) * 100);

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-neutral-500">Update your contact details and how teammates see you.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-xl border border-neutral-200 bg-white p-6 dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-20 w-20 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-3xl font-extrabold dark:bg-indigo-900/30 dark:text-indigo-300">
              {me.profile.full_name.charAt(0)}
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-900 dark:text-white">{me.profile.full_name}</div>
              <div className="text-xs uppercase tracking-wider text-neutral-500">{me.profile.role}</div>
            </div>
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            <Row icon={<Mail className="h-4 w-4" />} label="Email" value={me.profile.email} />
            <Row icon={<Briefcase className="h-4 w-4" />} label="Department" value={me.profile.department ?? "—"} />
            <Row icon={<Calendar className="h-4 w-4" />} label="Joined" value={new Date(me.profile.joined_at).toLocaleDateString()} />
          </dl>
          <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-900/20">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">Current level</div>
            <div className="mt-1 text-xl font-extrabold text-indigo-700 dark:text-indigo-200">{level.tier}</div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-white/60 dark:bg-indigo-950/60">
              <div className="h-full bg-indigo-600" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
              {level.next ? `${level.next - lifetime} pts to next tier` : "Top tier — Champion"}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <ProfileForm
            initial={{
              full_name: me.profile.full_name,
              phone: me.profile.phone,
              bio: me.profile.bio,
              avatar_url: me.profile.avatar_url,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-neutral-500 dark:bg-neutral-800">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-neutral-500">{label}</div>
        <div className="truncate text-sm font-medium text-neutral-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}
