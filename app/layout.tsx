import type { Metadata } from "next";
import Analytics from "@/components/Analytics";
import AttributionTracker from "@/components/AttributionTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "1759 MEDIA | 1759 Empire",
  description: "The nights, flyers and moving pictures of 1759 Empire.",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}<AttributionTracker /><Analytics /></body></html>;
}