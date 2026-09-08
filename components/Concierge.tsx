"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { usePathname } from "next/navigation";
import { getAttribution } from "@/lib/attribution";
import { trackEvent } from "@/lib/analytics";

type Action = { type: "BOOK_ROOM" | "VIEW_EVENT" | "EVENT_ENQUIRY" | "WHATSAPP" | "GENERAL_ENQUIRY"; label: string; href: string };
type Message = { role: "user" | "assistant"; content: string; actions?: Action[] };
const starters = ["What rooms do you have?", "Is a room available this weekend?", "What events are coming up?", "What food do you serve?", "Can I make a VIP/table enquiry?"];

export default function Concierge() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const [open, setOpen] = useState(false); const [input, setInput] = useState(""); const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Welcome to 1759 Empire. I can help with rooms, dining, events and planning your visit." }]);
  function openPanel() { setOpen(true); trackEvent("ai_concierge_opened", { page: window.location.pathname }); }
  async function send(event?: FormEvent, prompt = input) {
    event?.preventDefault(); if (!prompt.trim() || loading) return; const userMessage = prompt.trim(); setInput(""); setMessages((current) => [...current, { role: "user", content: userMessage }]); setLoading(true); trackEvent("ai_concierge_message_sent", { page: window.location.pathname });
    try { const response = await fetch("/api/concierge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMessage, history: messages.slice(-6), attribution: getAttribution() }) }); const result = await response.json() as { ok: boolean; message?: string; actions?: Action[]; error?: string }; if (!response.ok || !result.ok) throw new Error(result.error || "The Concierge is unavailable right now."); setMessages((current) => [...current, { role: "assistant", content: result.message || "Please choose one of the options below.", actions: result.actions }]); } catch (error) { setMessages((current) => [...current, { role: "assistant", content: error instanceof Error ? error.message : "The Concierge is unavailable right now." }]); } finally { setLoading(false); }
  }
  return <div className="concierge"><button className="conciergeTrigger" onClick={openPanel} aria-expanded={open} aria-label="Open your personal AI Concierge">1759 <span>Concierge</span></button>{open && <section className="conciergePanel" aria-label="Your Personal AI Concierge"><header><div><p className="eyebrow">1759 EMPIRE</p><h2>Your Personal AI Concierge</h2></div><button className="conciergeClose" onClick={() => setOpen(false)} aria-label="Close Concierge">×</button></header><div className="conciergeMessages">{messages.map((message, index) => <div className={`conciergeMessage ${message.role}`} key={`${message.role}-${index}`}><p>{message.content}</p>{message.actions?.map((action) => <Link href={action.href} className="conciergeAction" key={`${action.type}-${action.href}`} onClick={() => { trackEvent("ai_concierge_cta_clicked", { cta_type: action.type, page: window.location.pathname }); if (action.type === "WHATSAPP") trackEvent("whatsapp_cta_clicked", { cta_location: "concierge", page: window.location.pathname }); }}>{action.label} →</Link>)}</div>)}{loading && <div className="conciergeMessage assistant"><p>Checking the right information...</p></div>}</div><div className="conciergeStarters">{messages.length === 1 && starters.map((starter) => <button key={starter} onClick={() => send(undefined, starter)}>{starter}</button>)}</div><form className="conciergeForm" onSubmit={send}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about 1759..." aria-label="Ask the Concierge" /><button className="button" disabled={loading || !input.trim()}>Send</button></form></section>}</div>;
}
