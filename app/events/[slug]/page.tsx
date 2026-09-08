import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Countdown from "@/components/Countdown";
import BrandedMedia from "@/components/BrandedMedia";
import EventEnquiryForm from "@/components/EventEnquiryForm";
import TrackedLink from "@/components/TrackedLink";
import TrackedWhatsAppLink from "@/components/TrackedWhatsAppLink";
import { getPublicEvent, resolveEventDate } from "@/lib/catalogue";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const event = await getPublicEvent((await params).slug);
  if (!event) return { title: "Event not found | 1759 Empire" };
  const description = event.short_description || event.description;
  return { title: `${event.title} | 1759 Empire`, description, openGraph: { title: event.title, description, images: event.image_url ? [event.image_url] : undefined } };
}

export default async function EventPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const event = await getPublicEvent((await params).slug);
  if (!event) notFound();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const eventDate = resolveEventDate(event);
  const query = await searchParams;
  const attributionQuery = new URLSearchParams();
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
    const value = query[key];
    if (typeof value === "string") attributionQuery.set(key, value);
  }
  const campaignSuffix = attributionQuery.toString() ? `&${attributionQuery.toString()}` : "";
  const whatsappUrl = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hello 1759 Empire, I'd like to enquire about ${event.title}.`)}` : "";
  return <main className="eventPage">
    <nav className="nav darkNav"><Link className="brand" href="/">1759 <span>EMPIRE</span></Link><Link className="textButton dark" href="/">Back home</Link></nav>
    <article className="eventDetail">
      <BrandedMedia className="eventDetailMedia" src={event.image_url} alt={event.title} fallback="The night starts here" />
      <div className="eventDetailCopy"><p className="eyebrow">CLUB KLASS · EVENT</p><h1>{event.title}</h1><p className="eventDate">{new Date(`${eventDate}T00:00:00`).toLocaleDateString("en-NG", { dateStyle: "full" })}{event.event_time ? ` · ${event.event_time.slice(0, 5)}` : ""}</p><p>{event.description}</p>{event.performers && <div className="performers"><p className="eyebrow">PERFORMERS</p><ul>{event.performers.map((performer) => <li key={performer}>{performer}</li>)}</ul></div>}{event.entry_price > 0 && <p className="entryPrice">Entry from ₦{event.entry_price.toLocaleString()}</p>}{event.show_countdown && <Countdown date={eventDate} time={event.event_time} />}<div className="actions">{whatsappUrl ? <TrackedWhatsAppLink className="button" context="event_detail" href={whatsappUrl}>WhatsApp Us</TrackedWhatsAppLink> : <TrackedLink className="button" href={`/book?event_id=${event.id}&event=${encodeURIComponent(event.title)}${campaignSuffix}`} eventName="event_enquiry_cta_clicked">Make an enquiry</TrackedLink>}{event.show_room_promotion && <TrackedLink className="button buttonOutline dark" href={`/book?event_id=${event.id}&event=${encodeURIComponent(event.title)}${campaignSuffix}`} eventName="booking_cta_clicked">Stay at 1759</TrackedLink>}</div></div>
    </article>
    {event.gallery.length > 0 && <section className="eventGallery"><p className="eyebrow">THE NIGHT</p><div>{event.gallery.map((image) => <img key={image} src={image} alt={`${event.title} event gallery`} />)}</div></section>}
    {event.video_url && <video className="eventVideo" controls preload="metadata" poster={event.image_url || undefined}><source src={event.video_url} /></video>}
    <section className="eventEnquirySection"><EventEnquiryForm eventId={event.id} eventTitle={event.title} whatsapp={whatsapp} /></section>
    {event.show_room_promotion && <section className="eventRoomPromo"><p className="eyebrow">COMING FOR THE EVENT?</p><h2>Stay at 1759<br /><em>after the night.</em></h2><Link className="button" href={`/book?event_id=${event.id}&event=${encodeURIComponent(event.title)}${campaignSuffix}`}>Check room availability</Link></section>}
  </main>;
}
