"use client";

import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { trackEvent } from "@/lib/analytics";

export default function TrackedLink({ eventName, eventParams, children, onClick, ...props }: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement> & { eventName: string; eventParams?: Record<string, string> }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) { trackEvent(eventName, { page: window.location.pathname, ...eventParams }); onClick?.(event); }
  return <Link {...props} onClick={handleClick}>{children}</Link>;
}