import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smoker — Supply Chain Threat Detection",
  description: "Smoke detection for software supply chain attacks",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className="min-h-full flex-col"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
