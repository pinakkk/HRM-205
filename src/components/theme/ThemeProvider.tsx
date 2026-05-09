"use client";

import { useEffect } from "react";

const STORAGE_KEY = "fr-theme";

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(stored ?? (prefersDark ? "dark" : "light"));
  }, []);
  return <>{children}</>;
}

export function setTheme(theme: "light" | "dark") {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function getTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
