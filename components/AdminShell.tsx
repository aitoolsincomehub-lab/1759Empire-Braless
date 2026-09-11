"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

const navigation = [
  { label: "Overview", href: "/admin", group: "Overview" },
  { label: "Homepage", href: "/admin/marketing/homepage", group: "Marketing" },
  { label: "Concierge", href: "/admin/marketing/concierge", group: "Marketing" },
  { label: "Events", href: "/admin/marketing/events", group: "Marketing" },
  { label: "Braless", href: "/admin/marketing/braless", group: "Marketing" },
  { label: "Club Klass", href: "/admin/marketing/club-klass", group: "Marketing" },
  { label: "Media", href: "/admin/media", group: "Marketing" },
  { label: "Bookings", href: "/admin/sales/bookings", group: "Sales" },
  { label: "Enquiries", href: "/admin/sales/enquiries", group: "Sales" },
  { label: "Room enquiries", href: "/admin/sales/room-enquiries", group: "Sales" },
  { label: "Rooms", href: "/admin/business/rooms", group: "Business" },
  { label: "Food & Drinks", href: "/admin/business/food-drinks", group: "Business" },
  { label: "Business Information", href: "/admin/business/information", group: "Business" },
  { label: "Leads / Sources", href: "/admin/insights/leads", group: "Insights" },
  { label: "Conversions", href: "/admin/insights/conversions", group: "Insights" },
  { label: "Event performance", href: "/admin/insights/events", group: "Insights" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [logoutError, setLogoutError] = useState("");

  async function logout(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setLogoutError("");
    const supabase = getSupabaseBrowser();
    if (!supabase) { setLogoutError("Sign-out is temporarily unavailable."); return; }
    const { error } = await supabase.auth.signOut();
    if (error) { setLogoutError("Sign-out could not be completed. Please try again."); return; }
    window.location.assign("/admin/login");
  }

  return <div className="adminDesk">
    <aside className="adminDeskSidebar">
      <div className="adminDeskBrand">
        <Link className="adminDeskLogo" href="/admin">1759 <span>EMPIRE</span></Link>
        <span className="adminDeskLabel">STAFF DESK</span>
      </div>

      <nav className="adminDeskNav">
        {navigation.map((item) => <Link className={getActiveClass(item.href, pathname)} href={item.href} key={item.href}>{item.label}</Link>)}
      </nav>

      <div className="adminDeskFooter">
        <Link href="/">View Website</Link>
        <Link href="/admin/login">Staff / Account</Link>
        <a href="/admin/login" onClick={logout}>Logout</a>
        {logoutError && <span role="alert">{logoutError}</span>}
      </div>
    </aside>

    <section className="adminDeskMain">
      {children}
    </section>
  </div>;
}

function getActiveClass(href: string, pathname: string | null) {
  return pathname === href ? "adminDeskNavItem active" : "adminDeskNavItem";
}

export function AdminPageHeader({ eyebrow, title, description, action, actionHref = "/admin" }: { eyebrow?: string; title: string; description: string; action?: string; actionHref?: string }) {
  return <section className="adminPageHeader">
    <div>
      {eyebrow && <span className="adminEyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      <p className="adminIntro">{description}</p>
    </div>
    {action && <Link className="adminPrimaryButton" href={actionHref}>{action}</Link>}
  </section>;
}

export function AdminSectionCard({ title, children }: { title: string; children: ReactNode }) {
  return <section className="adminSectionCard">
    <div className="adminSectionCardHead">
      <h2>{title}</h2>
    </div>
    <div className="adminSectionCardBody">{children}</div>
  </section>;
}

export function AdminStatCard({ label, value }: { label: string; value: string | number }) {
  return <article className="adminStatCard">
    <span>{label}</span>
    <strong>{String(value)}</strong>
  </article>;
}

export function AdminEmptyState({ title, description }: { title: string; description: string }) {
  return <section className="adminEmptyState">
    <h3>{title}</h3>
    <p>{description}</p>
  </section>;
}
