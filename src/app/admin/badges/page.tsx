import { requireAdmin } from "@/lib/auth";
import {
  CreateBadgeForm,
  AssignAchievementForm,
  BadgeCriteriaSettings,
  BadgeInventory
} from "./badge-admin-components";
import { Bell, Sparkles } from "lucide-react";

export default async function AdminBadgesPage() {
  await requireAdmin();
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Badge Management</h1>
          <p className="text-sm text-neutral-500">Design achievements, set criteria, and award badges to recognize excellence ({today})</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 shadow-sm">
            <Bell className="h-5 w-5" />
          </button>
          <button className="flex h-10 px-4 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 shadow-lg shadow-red-200">
            <Sparkles className="h-4 w-4" />
            <span>Badge Analytics</span>
          </button>
        </div>
      </div>

      {/* Main Badge Inventory - Now at the Top */}
      <div className="w-full">
        <BadgeInventory />
      </div>

      {/* Management Actions Grid - Now under the Inventory */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CreateBadgeForm />
        </div>
        <div className="lg:col-span-1">
          <AssignAchievementForm />
        </div>
        <div className="lg:col-span-1">
          <BadgeCriteriaSettings />
        </div>
      </div>
    </div>
  );
}
