import type { Profile } from "@/lib/auth";

export type Role = "employee" | "admin";

export function isAdmin(profile: Pick<Profile, "role"> | null | undefined): boolean {
  return profile?.role === "admin";
}

export function canAwardManual(profile: Profile | null) {
  return isAdmin(profile);
}

export function canApproveRedemption(profile: Profile | null) {
  return isAdmin(profile);
}

export function canRunAllocator(profile: Profile | null) {
  return isAdmin(profile);
}
