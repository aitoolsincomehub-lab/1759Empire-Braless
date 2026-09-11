import Link from "next/link";
import { getPublicCatalogue, isApprovedPublicAsset } from "@/lib/catalogue";

export default async function EventsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { events } = await getPublicCatalogue();
  const query = await searchParams;
  const attributionQuery = new URLSearchParams();
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
    const value = query[key];
    if (typeof value === "string") attributionQuery.set(key, value);
  }
  const campaignSuffix = attributionQuery.toString() ? `?${attributionQuery.toString()}` : "";
  return <main className="eventsPage"><nav className="nav darkNav"><Link className="brand" href="/">1759 <span>EMPIRE</span></Link><Link className="textButton dark" href="/">Back home</Link></nav><section className="eventsListing"><p className="eyebrow">CLUB KLASS · WHAT'S ON</p><h1>Events made<br /><em>for the night.</em></h1>{events.length === 0 ? <div className="emptyState"><h2>Good nights are ahead.</h2><p>Discover Club Klass, good food and a place to stay after the night.</p><Link className="button" href={`/book${campaignSuffix}`}>Stay at 1759</Link></div> : <div className="eventList">{events.map((event) => <Link className="eventListCard" href={`/events/${event.slug}${campaignSuffix}`} key={event.id}><div>{event.image_url && isApprovedPublicAsset(event.image_url) ? <img src={event.image_url} alt={event.title} /> : <span className="eventFallback">Club Klass</span>}</div><p className="eyebrow">{new Date(`${event.event_date}T00:00:00`).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p><h2>{event.title}</h2><p>{event.short_description || event.description}</p></Link>)}</div>}</section></main>;
}
