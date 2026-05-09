"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function useRealtimeWallet(userId: string | null) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`ledger:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "rewards_ledger",
          filter: `user_id=eq.${userId}`,
        },
        () => setTick((t) => t + 1),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return tick;
}
