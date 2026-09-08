"use client";

export type StoredAttribution = {
  source: string;
  source_type: "website" | "event" | "whatsapp" | "social" | "referral" | "direct";
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
};

const cookieName = "1759_attribution";
const cookieMaxAge = 60 * 60 * 24 * 90;
const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

function readCookie(): StoredAttribution | null {
  if (typeof document === "undefined") return null;
  const value = document.cookie.split("; ").find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  if (!value) return null;
  try { return JSON.parse(decodeURIComponent(value)) as StoredAttribution; } catch { return null; }
}

function writeCookie(value: StoredAttribution) {
  document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=${cookieMaxAge}; samesite=lax`;
}

export function captureAttribution() {
  if (typeof window === "undefined") return null;
  const current = readCookie() || { source: "Direct", source_type: "direct", utm_source: "", utm_medium: "", utm_campaign: "", utm_content: "" };
  const params = new URLSearchParams(window.location.search);
  const incoming = Object.fromEntries(utmKeys.map((key) => [key, params.get(key)?.trim() || ""]));
  const referrer = document.referrer;
  const referrerHost = referrer ? (() => { try { return new URL(referrer).hostname; } catch { return ""; } })() : "";
  const source = incoming.utm_source || current.source || (referrerHost ? referrerHost.replace(/^www\./, "") : "Direct");
  const sourceType: StoredAttribution["source_type"] = incoming.utm_source ? (incoming.utm_source.toLowerCase() === "whatsapp" ? "whatsapp" : "social") : current.source_type || (referrerHost ? "referral" : "direct");
  const next = { ...current, ...incoming, source, source_type: sourceType };
  writeCookie(next);
  return next;
}

export function getAttribution(): StoredAttribution {
  return readCookie() || captureAttribution() || { source: "Direct", source_type: "direct", utm_source: "", utm_medium: "", utm_campaign: "", utm_content: "" };
}
