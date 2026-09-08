"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const supabase = getSupabaseBrowser();
    if (!supabase) { setError("Staff sign-in is temporarily unavailable. Please contact your manager."); setLoading(false); return; }
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) setError("Those login details were not accepted."); else window.location.assign("/admin");
    setLoading(false);
  }
  return <main className="bookingPage"><nav className="nav darkNav"><Link className="brand" href="/">1759 <span>EMPIRE</span></Link><Link className="textButton dark" href="/">Back home</Link></nav><div className="bookingWrap"><p className="eyebrow">STAFF ACCESS</p><h1>Welcome<br /><em>back.</em></h1><p className="muted">Sign in to manage rooms, bookings, events, food and media.</p>{error && <div className="formError" role="alert">{error}</div>}<form className="bookingForm singleColumn" onSubmit={submit}><label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="button wide" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button></form></div></main>;
}
