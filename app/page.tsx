import Link from "next/link";
import Countdown from "@/components/Countdown";
import BrandedMedia from "@/components/BrandedMedia";
import GeneralEnquiryForm from "@/components/GeneralEnquiryForm";
import TrackedLink from "@/components/TrackedLink";
import TrackedWhatsAppLink from "@/components/TrackedWhatsAppLink";
import { findBralessEvent, getPublicCatalogue, isApprovedPublicAsset } from "@/lib/catalogue";
import type { MediaAsset } from "@/types";

const FALLBACK_ROOMS = [
  { id: "deluxe-room", name: "Deluxe Room", price: "", image: "/assets/rooms/room-01.webp", note: "A calm, comfortable place to land." },
  { id: "executive-room", name: "Executive Room", price: "", image: "/assets/rooms/room-02.webp", note: "More room for longer stays and late nights." },
];

const SLOT_FALLBACKS = {
  food: ["/assets/food/food-01.webp", "/assets/food/food-02.webp", "/assets/food/food-03.webp"],
  drinks: "/assets/drinks/drinks-01.webp",
  club: ["/assets/club-klass/club-klass-01.webp", "/assets/club-klass/club-klass-02.webp", "/assets/club-klass/club-klass-03.webp"],
  braless: "/assets/braless/braless-01.webp",
  viewing: "/assets/viewing-centre/viewing-centre-01.webp",
  gallery: ["/assets/gallery/gallery-01.webp", "/assets/gallery/gallery-02.webp", "/assets/gallery/gallery-03.webp"],
} as const;

const PRODUCTION_ASSETS = new Set([
  "/assets/hero/1759-exterior-current-hero.webp",
  "/assets/hero/1759-exterior-current-mobile.webp",
  "/assets/brand/1759-empire-logo-transparent.png",
  "/assets/rooms/room-01.webp",
  "/assets/rooms/room-02.webp",
  "/assets/rooms/room-03.webp",
  "/assets/food/food-01.webp",
  "/assets/food/food-02.webp",
  "/assets/food/food-03.webp",
  "/assets/food/food-04.webp",
  "/assets/drinks/drinks-01.webp",
  "/assets/drinks/drinks-02.webp",
  "/assets/drinks/drinks-03.webp",
  "/assets/drinks/drinks-04.webp",
  "/assets/drinks/drinks-05.webp",
  "/assets/club-klass/club-klass-01.webp",
  "/assets/club-klass/club-klass-02.webp",
  "/assets/club-klass/club-klass-03.webp",
  "/assets/club-klass/club-klass-04.webp",
  "/assets/braless/braless-01.webp",
  "/assets/braless/braless-02.webp",
  "/assets/events/event-01.webp",
  "/assets/events/event-02.webp",
  "/assets/events/event-03.webp",
  "/assets/viewing-centre/viewing-centre-01.webp",
  "/assets/viewing-centre/viewing-centre-02.webp",
  "/assets/gallery/gallery-01.webp",
  "/assets/gallery/gallery-02.webp",
  "/assets/gallery/gallery-03.webp",
  "/assets/nightlife/nightlife-01.webp",
  "/assets/nightlife/nightlife-02.webp",
]);

function localAssetOrEmpty(path: string) {
  return PRODUCTION_ASSETS.has(path) ? path : "";
}

function mediaFor(media: MediaAsset[], predicate: (item: MediaAsset) => boolean, fallback: string) {
  return media.find((item) => item.is_published && predicate(item) && isApprovedPublicAsset(item.public_url))?.public_url || fallback;
}

function mediaBySection(media: MediaAsset[], section: MediaAsset["section"], fallback: string, index = 0) {
  const items = media.filter((item) => item.is_published && item.section === section && isApprovedPublicAsset(item.public_url));
  return items[index]?.public_url || fallback;
}

function mediaThumbnail(item: MediaAsset) {
  return item.thumbnail_url || item.public_url || "";
}

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const catalogue = await getPublicCatalogue();
  const query = await searchParams;
  const attributionQuery = new URLSearchParams();
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
    const value = query[key];
    if (typeof value === "string") attributionQuery.set(key, value);
  }
  const campaignSuffix = attributionQuery.toString() ? `?${attributionQuery.toString()}` : "";
  const featuredEvent = catalogue.events.find((event) => event.is_featured) || catalogue.events[0] || null;
  const bralessEvent = findBralessEvent(catalogue.events);

  const hero = isApprovedPublicAsset(catalogue.settings.hero_media_url) ? catalogue.settings.hero_media_url : "/assets/hero/1759-exterior-current-hero.webp";
  const foodImages = SLOT_FALLBACKS.food.map((fallback, index) => mediaBySection(catalogue.media, "food", localAssetOrEmpty(fallback), index));
  const clubImages = SLOT_FALLBACKS.club.map((fallback, index) => mediaBySection(catalogue.media, "club", localAssetOrEmpty(fallback), index));
  const galleryImages = SLOT_FALLBACKS.gallery.map((fallback, index) => mediaBySection(catalogue.media, "gallery", localAssetOrEmpty(fallback), index));
  const viewingImage = mediaBySection(catalogue.media, "tv", localAssetOrEmpty(SLOT_FALLBACKS.viewing));
  const bralessImage = mediaBySection(catalogue.media, "braless", localAssetOrEmpty(SLOT_FALLBACKS.braless));
  const bralessGallery = [bralessImage, mediaBySection(catalogue.media, "braless", localAssetOrEmpty(SLOT_FALLBACKS.braless), 1)];

  const displayedRooms = catalogue.rooms.length > 0
    ? catalogue.rooms.map((room, index) => ({
        id: room.id,
        name: room.name,
        price: room.price_per_night > 0 ? `₦${room.price_per_night.toLocaleString()}` : "",
        image: mediaBySection(catalogue.media, "rooms", localAssetOrEmpty(FALLBACK_ROOMS[index % FALLBACK_ROOMS.length].image), index),
        note: room.amenities.join(" · ") || room.description || "Details available on request",
      }))
    : FALLBACK_ROOMS;

  const youtube = catalogue.media.filter((item) => item.platform === "youtube" && item.is_published && (item.external_url || item.public_url)).slice(0, 3);
  const mixcloud = catalogue.media.filter((item) => item.platform === "mixcloud" && item.is_published && (item.external_url || item.public_url)).slice(0, 3);
  const highlights = catalogue.media.filter((item) => item.is_published && ["event_highlight", "event_recap", "event_teaser", "short", "dj_clip", "dj_set"].includes(item.content_type || "") && (item.external_url || item.public_url)).slice(0, 4);
  const artists = catalogue.events.flatMap((event) => event.performer_socials || []).filter((artist) => Boolean(artist.instagram || artist.tiktok || artist.youtube || artist.mixcloud || artist.website));

  const eventImage = mediaFor(catalogue.media, (item) => item.section === "events" && isApprovedPublicAsset(item.public_url), "/assets/events/event-01.webp");

  return <main>
    <section className="hero" style={{ backgroundImage: `linear-gradient(90deg,rgba(7,7,7,.88) 0%,rgba(7,7,7,.58) 48%,rgba(7,7,7,.18) 100%),url("${hero}")` }}>
      <nav className="nav" aria-label="Primary navigation">
        <Link href="/" className="logoWrap" aria-label="1759 Empire home"><img src="/assets/brand/1759-empire-logo-transparent.png" alt="1759 Empire" /></Link>
        <div className="links"><a href="#stay">Stay</a><a href="#dine">Dine</a><a href="#club">Club Klass</a><a href="#events">Events</a><a href="#media">Media</a></div>
        <TrackedLink className="button buttonOutline" href="/book" eventName="booking_cta_clicked">Check Availability</TrackedLink>
      </nav>
      <div className="heroContent">
        <p className="eyebrow">AKUTE · LAGOS · 1759 EMPIRE</p>
        <h1>{catalogue.settings.hero_headline.includes(".") ? <>{catalogue.settings.hero_headline.split(".")[0]}.<br /><em>{catalogue.settings.hero_headline.split(".").slice(1).join(".").trim()}</em></> : catalogue.settings.hero_headline}</h1>
        <p className="heroText">{catalogue.settings.hero_subheadline}</p>
        <div className="actions"><TrackedLink className="button" href="/book" eventName="booking_cta_clicked">{catalogue.settings.hero_primary_cta}</TrackedLink><a className="textLink" href="#club">{catalogue.settings.hero_secondary_cta} ↓</a></div>
      </div>
      <div className="heroMeta"><span>HOTEL · LOUNGE · CLUB</span><span>STAY · DINE · PARTY · WATCH · BELONG</span></div>
    </section>

    <section className="experienceRail" aria-label="1759 experiences">
      {["Luxury rooms", "Nigerian dining", "Club Klass", "Live events", "Viewing centre"].map((label, index) => <a href={["#stay", "#dine", "#club", "#events", "#viewing"][index]} key={label}><span>0{index + 1}</span><strong>{label}</strong><small>{["Rest in style", "Taste the culture", "Music. People. Energy.", "Make the night count", "Sports. Food. Company."][index]}</small></a>)}
    </section>

    {catalogue.settings.show_featured_event && <section className="featuredEvent">
      <div className="featuredEventCopy"><p className="eyebrow">{featuredEvent ? "EVENT OF THE MONTH" : "CLUB KLASS · EVENTS"}</p><h2>{featuredEvent ? <>{featuredEvent.title}<br /><em>is calling.</em></> : <>The next big night<br /><em>is calling.</em></>}</h2><p>{featuredEvent?.short_description || "Good music, full tables and a reason to make the night count."}</p>{featuredEvent?.show_countdown && <Countdown date={featuredEvent.event_date} time={featuredEvent.event_time} />}<div className="actions">{featuredEvent?.slug ? <TrackedLink className="button" href={`/events/${featuredEvent.slug}${campaignSuffix}`} eventName="event_cta_clicked">Explore event</TrackedLink> : <TrackedLink className="button" href={`/events${campaignSuffix}`} eventName="event_cta_clicked">See what's on</TrackedLink>}{catalogue.settings.whatsapp_number ? <TrackedWhatsAppLink className="textLink" context="featured_event" href={`https://wa.me/${catalogue.settings.whatsapp_number}?text=${encodeURIComponent("Hello 1759 Empire, I would like to make an event enquiry.")}`}>Event enquiry</TrackedWhatsAppLink> : <Link className="textLink" href={`/book${campaignSuffix}`}>Event enquiry</Link>}</div></div><BrandedMedia className="featuredEventMedia" src={eventImage} alt={featuredEvent?.title || "1759 Empire event"} fallback="Event artwork will appear here" />
    </section>}

    <section className="statement"><p className="eyebrow">THE 1759 EXPERIENCE</p><h2>One destination.<br /><em>Different reasons to stay.</em></h2><p>Check in, eat well, meet friends, celebrate something or stay out late. 1759 brings hospitality and entertainment together without making the experience feel complicated.</p></section>

    {catalogue.settings.show_rooms_section && <section id="stay" className="section sectionLight"><div className="sectionHead"><div><p className="eyebrow">STAY</p><h2>Rooms & Suites</h2></div><TrackedLink href="/book" className="textLink dark" eventName="booking_cta_clicked">Check availability →</TrackedLink></div><div className="roomGrid">{displayedRooms.map((room) => <article className="room" key={room.id || room.name}><BrandedMedia className="mediaSlot" src={room.image} alt={room.name} fallback="Room photography coming soon" /><div className="roomBody"><div><h3>{room.name}</h3><p>{room.note}</p></div>{room.price && <strong>{room.price}<small>/night</small></strong>}</div></article>)}</div><div className="bathroomNote"><span>ROOM DETAIL</span><strong>Thoughtful details, calm interiors and an easy place to reset.</strong></div></section>}

    <section id="dine" className="dine"><div className="dineCopy"><p className="eyebrow">DINE · DRINK</p><h2>Food for the table.<br /><em>Energy for the night.</em></h2><p>{catalogue.settings.dine_description}</p>{catalogue.menu.length > 0 && <div className="menuPreview">{catalogue.menu.slice(0, 6).map((item) => <div key={item.id}><strong>{item.name}</strong>{item.price > 0 && <span>₦{item.price.toLocaleString()}</span>}</div>)}</div>}<a className="button" href="#contact">Enquire about dining</a></div><div className="foodGrid">{foodImages.map((src, index) => <BrandedMedia key={src} className={`foodCard food${index + 1}`} src={src} alt={["Pepper chicken and Nigerian sides", "Goat pepper soup", "Jollof rice at 1759 Empire"][index]} fallback={["Pepper chicken", "Goat pepper soup", "Jollof rice"][index]}><span>{["FOOD AT 1759", "THE TABLE", "SIGNATURE DISHES"][index]}</span></BrandedMedia>)}</div></section>

    <section id="club" className="club"><div className="clubCopy"><p className="eyebrow">THE NIGHTLIFE DESTINATION</p><div className="clubTitle">CLUB<br /><span>KLASS</span></div><p>{catalogue.settings.club_description}</p><a className="button" href="#events">What's happening</a></div><div className="nightGrid">{clubImages.map((src, index) => <BrandedMedia className={`nightCard n${index}`} key={src} src={src} alt={["Club Klass atmosphere", "Live nightlife at 1759 Empire", "Late-night performance"][index]} fallback={["Club Klass", "Nightlife", "The night"][index]}><span>{["Club Klass", "Live nights", "After dark"][index]}</span></BrandedMedia>)}</div></section>

    <section className="bralessSection"><div className="bralessMedia"><BrandedMedia src={bralessImage} alt="Braless Party at 1759 Empire" fallback="Braless Party" /></div><div className="bralessCopy"><p className="eyebrow">A RECURRING 1759 EXPERIENCE</p><h2>Braless<br /><em>Party.</em></h2><p>{bralessEvent?.short_description || "A recognizable 1759 night built around atmosphere, music and a room full of energy."}</p><Link className="button" href={bralessEvent?.slug ? `/events/${bralessEvent.slug}` : "/events"}>See what's happening</Link></div><div className="bralessDetail">{bralessGallery.map((src, index) => <BrandedMedia key={`${src}-${index}`} src={src} alt="Braless Party at 1759 Empire" fallback="Braless experience" />)}</div></section>

    <section id="viewing" className="viewingCentre"><div className="viewingCopy"><p className="eyebrow">LOUNGE · VIEWING CENTRE</p><h2>Watch the game.<br /><em>Meet your people.</em></h2><p>{catalogue.settings.lounge_description}</p><a className="button" href="#contact">Plan your visit</a></div><BrandedMedia className="viewingMedia" src={viewingImage} fallback="Big screens. Good company." alt="Sports viewing lounge at 1759 Empire" /></section>

    {catalogue.settings.show_events_section && <section id="events" className="events"><div className="sectionHead"><div><p className="eyebrow">WHAT'S ON</p><h2>Events made<br /><em>for the night.</em></h2></div><Link className="textLink dark" href="/events">All events →</Link></div><div className="eventCard"><BrandedMedia className="eventMedia" src={eventImage} alt={featuredEvent?.title || "1759 Empire event"} fallback="Event artwork coming soon"><span>{featuredEvent?.title || "Club Klass"}</span></BrandedMedia><div className="eventInfo"><p className="eventLabel">1759 EMPIRE · EVENTS</p><h3>{featuredEvent?.title || "The next big night"}</h3><p>{featuredEvent?.description || "Good music, full tables and a reason to make the night count."}</p>{featuredEvent?.slug ? <Link className="textLink dark" href={`/events/${featuredEvent.slug}`}>Explore event →</Link> : <Link className="textLink dark" href="/events">Event enquiries →</Link>}</div></div></section>}

    {(youtube.length > 0 || mixcloud.length > 0 || highlights.length > 0) && <section id="media" className="mediaHub"><div className="sectionHead"><div><p className="eyebrow">1759 MEDIA · WATCH · LISTEN</p><h2>More from the Empire.</h2></div><span className="mediaHubHint">YouTube · Mixcloud · Event highlights</span></div><div className="mediaHubGrid">{[...youtube, ...mixcloud, ...highlights].slice(0, 6).map((item) => <article className="mediaHubCard" key={item.id}><a href={item.external_url || item.public_url || "#"} target={item.external_url ? "_blank" : undefined} rel={item.external_url ? "noreferrer" : undefined}><div className="mediaHubImage">{isApprovedPublicAsset(mediaThumbnail(item)) ? <img src={mediaThumbnail(item)} alt={item.alt_text || item.title || "1759 Empire media"} loading="lazy" /> : <div className="mediaFallback"><span className="mediaMark">1759</span><strong>{item.title || "Media feature"}</strong><small>Content slot</small></div>}</div><div><span>{item.platform || "website"} · {item.content_type || "media"}</span><strong>{item.title || "1759 Empire"}</strong><p>{item.caption || item.social_caption || "Watch, listen and stay close to the Empire."}</p></div></a></article>)}</div></section>}

    {artists.length > 0 && <section className="artistsSection"><div className="sectionHead"><div><p className="eyebrow">FOLLOW THE ARTISTS</p><h2>DJ and artist links.</h2></div></div><div className="artistGrid">{artists.map((artist, index) => <article className="artistCard" key={`${artist.name}-${index}`}><strong>{artist.name}</strong>{artist.instagram && <a href={artist.instagram}>Instagram</a>}{artist.tiktok && <a href={artist.tiktok}>TikTok</a>}{artist.youtube && <a href={artist.youtube}>YouTube</a>}{artist.mixcloud && <a href={artist.mixcloud}>Mixcloud</a>}{artist.website && <a href={artist.website}>Website</a>}</article>)}</div></section>}

    <section className="galleryIntro"><p className="eyebrow">THE ATMOSPHERE</p><h2>See the night.<br /><em>Then come experience it.</em></h2><div className="momentStrip">{galleryImages.map((src, index) => <BrandedMedia key={`${src || "gallery"}-${index}`} src={src} fallback={["Stay", "Dine", "Late nights"][index] || "1759 Empire atmosphere"} alt="1759 Empire atmosphere" />)}</div><p>Hotel calm, open-air energy and Club Klass after dark, all in one destination.</p></section>

    <section id="contact" className="contact"><div><p className="eyebrow">FIND US</p><h2>{catalogue.settings.address}</h2><p>{catalogue.settings.contact_cta}</p><p>{catalogue.settings.phone || catalogue.settings.booking_contact}{catalogue.settings.email ? ` · ${catalogue.settings.email}` : ""}</p><div className="actions"><TrackedLink className="button" href="/book" eventName="booking_cta_clicked">Check room availability</TrackedLink>{catalogue.settings.whatsapp_number ? <TrackedWhatsAppLink className="textLink dark" context="contact" href={`https://wa.me/${catalogue.settings.whatsapp_number}?text=${encodeURIComponent("Hello 1759 Empire, I'd like to make an enquiry.")}`}>WhatsApp us</TrackedWhatsAppLink> : <Link className="textLink dark" href="/book">Contact 1759</Link>}</div></div><GeneralEnquiryForm whatsapp={catalogue.settings.whatsapp_number} /></section>

    <footer><img src="/assets/brand/1759-empire-logo-transparent.png" alt={catalogue.settings.business_name} /><span>{catalogue.settings.business_name} · Hotel · Lounge · Club · © 2026 1759 Empire</span><span>Stay · Dine · Party · Watch · Belong</span></footer>
  </main>;
}
