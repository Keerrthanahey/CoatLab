import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { CursorGlow } from "@/components/interactive/cursor-glow";

export const metadata: Metadata = {
  title: {
    default: "CoatLab · Materials Intelligence",
    template: "%s · CoatLab",
  },
  description:
    "AI-assisted prediction and analysis of coating properties for advanced materials.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        <AuthProvider>
          {children}
          <CursorGlow />
        </AuthProvider>
      </body>
    </html>
  );
}
