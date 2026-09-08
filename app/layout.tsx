import type { Metadata } from "next";
import Analytics from "@/components/Analytics";
import AttributionTracker from "@/components/AttributionTracker";
import Concierge from "@/components/Concierge";
import "./globals.css";

export const metadata: Metadata = {
  title: "1759 Empire Lounge, Hotel & Suites",
  description: "Stay, dine, drink and experience 1759 Empire in Akute.",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}<AttributionTracker /><Analytics /><Concierge /></body></html>;
}