"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toasts } from "@/components/ui/Toaster";

type Initial = {
  full_name: string;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initial.full_name);
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial.avatar_url ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/me/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? body.title ?? "Save failed");
      }
      toasts.success("Profile saved.");
      router.refresh();
    } catch (err) {
      toasts.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-xl border border-neutral-200 bg-white p-6 dark:bg-neutral-900 dark:border-neutral-800">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full name">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            minLength={2}
            className="input"
          />
        </Field>
        <Field label="Phone">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 …"
            className="input"
          />
        </Field>
      </div>
      <Field label="Avatar URL">
        <input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://…"
          className="input"
        />
      </Field>
      <Field label="Bio">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Short intro for your teammates."
          className="input resize-none"
        />
      </Field>
      <div className="flex items-center justify-end gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </div>
      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(229 229 229);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          background: white;
          color: inherit;
        }
        :global(.dark .input) {
          background: rgb(23 23 23);
          border-color: rgb(38 38 38);
        }
        :global(.input:focus) {
          outline: none;
          border-color: rgb(99 102 241);
          box-shadow: 0 0 0 3px rgb(99 102 241 / 0.15);
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</span>
      {children}
    </label>
  );
}
