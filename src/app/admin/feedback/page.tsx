import { requireAdmin } from "@/lib/auth";
import {
  FeedbackStats,
  ProvideFeedback,
  EmployeeReviewSystem,
  ManagerComments
} from "./feedback-admin-components";
import { Bell, Search } from "lucide-react";

export default async function AdminFeedbackPage() {
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
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Feedback & Reviews</h1>
          <p className="text-sm text-neutral-500">Monitor performance reviews, manage feedback, and track manager insights ({today})</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search reviews..." 
              className="h-10 w-64 rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 shadow-sm">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <FeedbackStats />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Review System */}
        <div className="lg:col-span-2">
          <EmployeeReviewSystem />
        </div>

        {/* Action Sidebar */}
        <div className="flex flex-col gap-6">
          <ProvideFeedback />
          <ManagerComments />
        </div>
      </div>
    </div>
  );
}
