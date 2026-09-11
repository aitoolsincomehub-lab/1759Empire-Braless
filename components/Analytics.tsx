"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

const FALLBACK_GA_MEASUREMENT_ID = "G-CCVSKMKN";

export default function Analytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || FALLBACK_GA_MEASUREMENT_ID;
  const pathname = usePathname();

  useEffect(() => {
    if (!measurementId || typeof window === "undefined") return;
    if (!window.dataLayer) window.dataLayer = [];
    if (!window.gtag) {
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
    }
    trackEvent("page_view", { page_location: window.location.href, page_path: pathname });
  }, [measurementId, pathname]);

  if (!measurementId) return null;
  return <>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
    <Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;window.gtag('js',new Date());window.gtag('config','${measurementId}',{send_page_view:false});`}</Script>
  </>;
}
