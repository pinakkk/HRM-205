import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/Toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "FairReward AI",
  description: "Bias-aware reward & compensation system.",
};

const NO_FLASH_SCRIPT = `
(function(){try{
  var s=localStorage.getItem('fr-theme');
  var d=window.matchMedia('(prefers-color-scheme: dark)').matches;
  if(s==='dark'||(!s&&d)){document.documentElement.classList.add('dark');}
}catch(e){}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
