"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { getAttribution } from "@/lib/attribution";
import { trackEvent } from "@/lib/analytics";

export default function TrackedWhatsAppLink({ context, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { context?: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const attribution = getAttribution();
    trackEvent("whatsapp_cta_clicked", { cta_location: context || "website", page: window.location.pathname, ...attribution });
    props.onClick?.(event);
  }
  return <a {...props} onClick={handleClick}>{children}</a>;
}
