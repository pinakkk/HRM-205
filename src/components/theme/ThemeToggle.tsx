"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { getTheme, setTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const [theme, setLocal] = useState<"light" | "dark">("light");

  useEffect(() => {
    setLocal(getTheme());
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setLocal(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="group relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition-all hover:bg-neutral-800 hover:text-amber-300"
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        <Sun
          size={16}
          className={`absolute transition-all duration-300 ${
            theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
          }`}
        />
        <Moon
          size={16}
          className={`absolute transition-all duration-300 ${
            theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          }`}
        />
      </span>
    </button>
  );
}
