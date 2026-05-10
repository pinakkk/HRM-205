"use client";

import { useState } from "react";
import {
  Star,
  MessageSquare,
  Send,
  ThumbsUp,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export function FeedbackStats() {
  const stats = [
    { label: "Positive Reviews", value: "85%", trend: "+5%", icon: <ThumbsUp className="h-5 w-5 text-emerald-600" />, bgColor: "bg-emerald-50" },
    { label: "Neutral Reviews", value: "12%", trend: "-2%", icon: <MessageSquare className="h-5 w-5 text-blue-600" />, bgColor: "bg-blue-50" },
    { label: "Constructive", value: "03%", trend: "-3%", icon: <AlertCircle className="h-5 w-5 text-amber-600" />, bgColor: "bg-amber-50" },
    { label: "Total Feedback", value: "1,240", trend: "+120", icon: <Star className="h-5 w-5 text-indigo-600" />, bgColor: "bg-indigo-50" },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <div key={i} className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", stat.bgColor)}>
              {stat.icon}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              {stat.trend}
            </div>
          </div>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{stat.label}</p>
          <div className="mt-1 text-2xl font-black text-neutral-900">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

export function ProvideFeedback() {
  const [employee, setEmployee] = useState("");
  const [comment, setComment] = useState("");

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-neutral-900">Provide Feedback</h3>
        <p className="text-xs text-neutral-500">Directly send feedback to an employee</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-neutral-400 uppercase mb-1.5 block">Select Employee</label>
          <select 
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
          >
            <option value="">Choose an employee...</option>
            <option value="1">Alex Rivera</option>
            <option value="2">Sarah Chen</option>
            <option value="3">James Wilson</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-neutral-400 uppercase mb-1.5 block">Feedback Message</label>
          <textarea 
            className="w-full h-32 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            placeholder="Write your feedback here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-bold text-white hover:bg-neutral-800 transition-all">
          <Send className="h-4 w-4" />
          Send Feedback
        </button>
      </div>
    </div>
  );
}

export function EmployeeReviewSystem() {
  const reviews = [
    { id: 1, employee: "Sarah Chen", reviewer: "Admin", date: "2 hours ago", rating: 5, comment: "Excellent performance in the last project. Great teamwork!", sentiment: "positive" },
    { id: 2, employee: "James Wilson", reviewer: "Manager", date: "5 hours ago", rating: 4, comment: "Good progress on targets. Need to work on communication.", sentiment: "neutral" },
    { id: 3, employee: "Alex Rivera", reviewer: "Peer", date: "Yesterday", rating: 5, comment: "Always helpful and proactive. A pleasure to work with.", sentiment: "positive" },
  ];

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-50 p-6">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Employee Review System</h3>
          <p className="text-xs text-neutral-500">Comprehensive list of all employee reviews</p>
        </div>
        <button className="text-xs font-bold text-red-600 hover:underline">View All</button>
      </div>
      <div className="divide-y divide-neutral-50">
        {reviews.map((review) => (
          <div key={review.id} className="p-6 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-500">
                  {review.employee.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">{review.employee}</h4>
                  <p className="text-[10px] text-neutral-500">Reviewed by {review.reviewer} • {review.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200")} />
                ))}
              </div>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed italic">"{review.comment}"</p>
            <div className="mt-4 flex items-center gap-2">
              <span className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                review.sentiment === "positive" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
              )}>
                {review.sentiment}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ManagerComments() {
  const comments = [
    { manager: "Marcus Aurelius", employee: "Sarah Chen", text: "Ready for promotion to Senior Designer.", priority: "high" },
    { manager: "Seneca the Younger", employee: "Alex Rivera", text: "Requires training in advanced React patterns.", priority: "medium" },
  ];

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-neutral-900">Manager Comments</h3>
        <span className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">
          {comments.length}
        </span>
      </div>
      <div className="space-y-4">
        {comments.map((c, i) => (
          <div key={i} className="group relative rounded-xl border border-neutral-50 p-4 hover:border-red-100 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-lg bg-neutral-900 flex items-center justify-center text-[10px] font-bold text-white">
                {c.manager.split(' ')[0][0]}{c.manager.split(' ')[1][0]}
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">{c.manager}</p>
                <p className="text-[10px] text-neutral-400">regarding {c.employee}</p>
              </div>
            </div>
            <p className="text-xs text-neutral-600 line-clamp-2">{c.text}</p>
            <button className="mt-3 flex items-center gap-1 text-[10px] font-bold text-red-600 group-hover:gap-2 transition-all">
              Read More <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
