import type { GeneralEnquiry } from "@/types";

export default function AdminGeneralEnquiries({ items }: { items: GeneralEnquiry[] }) {
  return <div className="adminPanel"><div className="panelHeading"><h2>General enquiries</h2><span>{items.length} shown</span></div>{items.length === 0 ? <p className="muted">No general enquiries yet.</p> : <div className="bookingTable">{items.map((item) => <div className="bookingRow" key={item.id}><div><strong>{item.name}</strong><span>{item.phone}{item.email ? ` · ${item.email}` : ""}</span><span>{item.message}</span><span>{item.source}{item.utm_source ? ` · ${item.utm_source}` : ""}{item.utm_campaign ? ` · ${item.utm_campaign}` : ""}</span><span>{new Date(item.created_at).toLocaleString("en-NG")}</span></div></div>)}</div>}</div>;
}
