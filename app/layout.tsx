import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
