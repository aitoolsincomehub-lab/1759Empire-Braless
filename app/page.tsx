import Link from "next/link";
import Countdown from "@/components/Countdown";
import BrandedMedia from "@/components/BrandedMedia";
import GeneralEnquiryForm from "@/components/GeneralEnquiryForm";
import TrackedLink from "@/components/TrackedLink";
import TrackedWhatsAppLink from "@/components/TrackedWhatsAppLink";
import { getPublicCatalogue } from "@/lib/catalogue";

const rooms = [
  {id:"deluxe-room", name:"Deluxe Room", price:"", image:"", fallback:"A calm place to land", note:"Details available on request"},
  {id:"executive-room", name:"Executive Room", price:"", image:"", fallback:"More room for the night", note:"Details available on request"},
];

const nightlife = [
  {image:"/media_stills/night-crowd-01.jpg", label:"Club Klass"},
  {image:"/media_stills/night-performer-01.jpg", label:"Nightlife"},
  {image:"/media_stills/night-crowd-02.jpg", label:"The night"},
];

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const catalogue = await getPublicCatalogue();
  const query = await searchParams;
  const attributionQuery = new URLSearchParams();
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
    const value = query[key];
    if (typeof value === "string") attributionQuery.set(key, value);
  }
  const campaignSuffix = attributionQuery.toString() ? `?${attributionQuery.toString()}` : "";
  const featuredEvent = catalogue.events.find((event) => event.is_featured) || catalogue.events[0];
  const displayedRooms = catalogue.rooms.length > 0 ? catalogue.rooms.map((room) => ({ id: room.id, name: room.name, price: room.price_per_night > 0 ? `₦${room.price_per_night.toLocaleString()}` : "", image: room.images[0] || "", fallback: room.images.length > 0 ? "" : "A calm place to land", note: room.amenities.join(" · ") || room.description || "Details available on request" })) : rooms;
  return <main>
    <section className="hero" style={{ backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.84),rgba(0,0,0,.25)),url("${catalogue.settings.hero_media_url || "/media_stills/night-crowd-02.jpg"}")` }}>
      <nav className="nav">
        <Link href="/" className="logoWrap"><img src="/assets/brand/1759-empire-logo.webp" alt="1759 Empire" /></Link>
        <div className="links">
          <a href="#stay">Stay</a><a href="#dine">Dine</a><a href="#club">Club Klass</a><a href="#events">Events</a>
        </div>
        <TrackedLink className="button buttonOutline" href="/book" eventName="booking_cta_clicked">Check Availability</TrackedLink>
      </nav>
      <div className="heroContent">
        <p className="eyebrow">AKUTE · LAGOS</p>
        <h1>{catalogue.settings.hero_headline.includes(".") ? <>{catalogue.settings.hero_headline.split(".")[0]}.<br/><em>{catalogue.settings.hero_headline.split(".").slice(1).join(".").trim()}</em></> : catalogue.settings.hero_headline}</h1>
        <p className="heroText">{catalogue.settings.hero_subheadline}</p>
        <div className="actions"><TrackedLink className="button" href="/book" eventName="booking_cta_clicked">{catalogue.settings.hero_primary_cta}</TrackedLink><a className="textLink" href="#club">{catalogue.settings.hero_secondary_cta} ↓</a></div>
      </div>
      <div className="heroMeta"><span>1759 EMPIRE</span><span>HOTEL · LOUNGE · CLUB</span></div>
    </section>

    {catalogue.settings.show_featured_event && <section className="featuredEvent">
      <div className="featuredEventCopy"><p className="eyebrow">{featuredEvent ? "NEXT AT CLUB KLASS" : "CLUB KLASS · EVENTS"}</p><h2>{featuredEvent ? <>{featuredEvent.title}<br /><em>is calling.</em></> : <>The next big night<br /><em>is calling.</em></>}</h2><p>{featuredEvent?.short_description || "Good music, full tables and a reason to make the night count."}</p>{featuredEvent?.show_countdown && <Countdown date={featuredEvent.event_date} time={featuredEvent.event_time} />}<div className="actions">{featuredEvent?.slug ? <TrackedLink className="button" href={`/events/${featuredEvent.slug}${campaignSuffix}`} eventName="event_cta_clicked">Explore event</TrackedLink> : <TrackedLink className="button" href={`/events${campaignSuffix}`} eventName="event_cta_clicked">See what's on</TrackedLink>}{catalogue.settings.whatsapp_number ? <TrackedWhatsAppLink className="textLink" context="featured_event" href={`https://wa.me/${catalogue.settings.whatsapp_number}?text=${encodeURIComponent("Hello 1759 Empire, I would like to make an event enquiry.")}`}>Event enquiry</TrackedWhatsAppLink> : <Link className="textLink" href={`/book${campaignSuffix}`}>Event enquiry</Link>}</div></div><BrandedMedia className="featuredEventMedia" src={featuredEvent?.image_url} alt={featuredEvent?.title || "Club Klass signature night"} fallback="The night starts here" />
    </section>}

    <section className="statement">
      <p className="eyebrow">THE 1759 EXPERIENCE</p>
      <h2>One destination.<br/><em>Different reasons to stay.</em></h2>
      <p>Check in, eat well, meet friends, celebrate something or stay out late. 1759 brings the hotel and nightlife experience together.</p>
    </section>

    {catalogue.settings.show_rooms_section && <section id="stay" className="section">
      <div className="sectionHead"><div><p className="eyebrow">STAY</p><h2>Rooms & Suites</h2></div><TrackedLink href="/book" className="textLink dark" eventName="booking_cta_clicked">Check availability →</TrackedLink></div>
      <div className="roomGrid">
        {displayedRooms.map(r=><article className="room" key={r.id || r.name}>
          <BrandedMedia className="mediaSlot" src={r.image} alt={r.name} fallback={r.fallback}/>
          <div className="roomBody"><div><h3>{r.name}</h3><p>{r.note}</p></div>{r.price && <strong>{r.price}<small>/night</small></strong>}</div>
        </article>)}
      </div>
      <div className="bathroomNote"><span>ROOM DETAIL</span><strong>Thoughtful details, calm interiors and an easy place to reset.</strong></div>
    </section>}

    <section id="dine" className="dine">
      <div className="dineCopy"><p className="eyebrow">DINE · DRINK</p><h2>Food for the table.<br/><em>Energy for the night.</em></h2><p>{catalogue.settings.dine_description}</p>{catalogue.menu.length > 0 && <div className="menuPreview">{catalogue.menu.slice(0, 6).map((item) => <div key={item.id}><strong>{item.name}</strong>{item.price > 0 && <span>₦{item.price.toLocaleString()}</span>}</div>)}</div>}<a className="button" href="#contact">Enquire about dining</a></div>
      <div className="foodGrid">
        <div className="foodCard food1" style={{ backgroundImage: "linear-gradient(0deg,rgba(0,0,0,.65),transparent 55%),url('/media_stills/food-grill-01.jpg')" }}><span>FOOD AT 1759</span></div>
        <div className="foodCard food2" style={{ backgroundImage: "linear-gradient(0deg,rgba(0,0,0,.7),transparent 55%),url('/media_stills/night-crowd-01.jpg')" }}><span>THE TABLE</span></div>
        <div className="foodCard food3" style={{ backgroundImage: "linear-gradient(0deg,rgba(0,0,0,.7),transparent 55%),url('/media_stills/night-performer-01.jpg')" }}><span>BEFORE THE NIGHT</span></div>
      </div>
    </section>

    <section id="club" className="club">
      <div className="clubCopy"><p className="eyebrow">THE NIGHTLIFE DESTINATION</p><div className="clubTitle">CLUB<br/><span>KLASS</span></div><p>{catalogue.settings.club_description}</p><a className="button" href="#events">What's happening</a></div>
      <div className="nightGrid">{nightlife.map((n,i)=><BrandedMedia className={`nightCard n${i}`} key={n.image} src={n.image} alt={n.label} fallback={n.label}><span>{n.label}</span></BrandedMedia>)}</div>
    </section>

    <section className="bralessSection">
      <div className="bralessMedia"><img src="/media_stills/braless-crowd-01.jpg" alt="Braless Party crowd at 1759 Empire" /></div>
      <div className="bralessCopy"><p className="eyebrow">A RECURRING 1759 EXPERIENCE</p><h2>Braless<br /><em>Party.</em></h2><p>A recognizable 1759 night built around atmosphere, music and a room full of energy.</p><Link className="button" href="/events">See what's happening</Link></div>
      <div className="bralessDetail"><img src="/media_stills/braless-performers-01.jpg" alt="Braless Party performers at 1759 Empire" /><img src="/media_stills/braless-orisha-stage-01.jpg" alt="Braless Party stage at 1759 Empire" /></div>
    </section>

    <section className="viewingCentre"><div className="viewingCopy"><p className="eyebrow">LOUNGE · VIEWING CENTRE</p><h2>Watch the game.<br/><em>Meet your people.</em></h2><p>{catalogue.settings.lounge_description}</p><a className="button" href="#contact">Plan your visit</a></div><BrandedMedia className="viewingMedia" src="/media_stills/night-crowd-02.jpg" fallback="Big screens. Good company." alt="Nightlife atmosphere at 1759 Empire" /></section>

    {catalogue.settings.show_events_section && <section id="events" className="events">
      <div className="sectionHead"><div><p className="eyebrow">WHAT'S ON</p><h2>Events made<br/><em>for the night.</em></h2></div></div>
      <div className="eventCard">
          <BrandedMedia className="eventMedia" src={featuredEvent?.image_url} alt={featuredEvent?.title || "Club Klass event"} fallback={featuredEvent ? "A night worth making" : "Club Klass events"}><span>{featuredEvent?.title || "Club Klass"}</span></BrandedMedia>
          <div className="eventInfo"><p className="eventLabel">CLUB KLASS · EVENT</p><h3>{featuredEvent?.title || "The next big night"}</h3><p>{featuredEvent?.description || "Good music, full tables and a reason to make the night count."}</p>{featuredEvent?.slug ? <Link className="textLink dark" href={`/events/${featuredEvent.slug}`}>Explore event →</Link> : <a className="textLink dark" href="#contact">Event enquiries →</a>}</div>
      </div>
    </section>}

    <section className="galleryIntro"><p className="eyebrow">THE ATMOSPHERE</p><h2>See the night.<br/><em>Then come experience it.</em></h2><div className="momentStrip"><BrandedMedia src="/media_stills/night-crowd-01.jpg" fallback="Stay" alt="1759 Empire nightlife"/><BrandedMedia src="/media_stills/sound-dj-01.jpg" fallback="Dine" alt="DJ performance at 1759 Empire"/><BrandedMedia src="/media_stills/night-performer-01.jpg" fallback="Late nights" alt="Performer at 1759 Empire"/></div><p>Hotel calm, open-air energy and Club Klass after dark, all in one destination.</p></section>
    <section id="contact" className="contact">
      <div><p className="eyebrow">FIND US</p><h2>{catalogue.settings.address}</h2><p>{catalogue.settings.contact_cta}</p><p>{catalogue.settings.phone || catalogue.settings.booking_contact}{catalogue.settings.email ? ` · ${catalogue.settings.email}` : ""}</p><div className="actions"><TrackedLink className="button" href="/book" eventName="booking_cta_clicked">Check room availability</TrackedLink>{catalogue.settings.whatsapp_number ? <TrackedWhatsAppLink className="textLink dark" context="contact" href={`https://wa.me/${catalogue.settings.whatsapp_number}?text=${encodeURIComponent("Hello 1759 Empire, I'd like to make an enquiry.")}`}>WhatsApp us</TrackedWhatsAppLink> : <Link className="textLink dark" href="/book">Contact 1759</Link>}</div></div>
      <GeneralEnquiryForm whatsapp={catalogue.settings.whatsapp_number} />
    </section>

    <footer><img src="/assets/brand/1759-empire-logo.webp" alt={catalogue.settings.business_name}/><span>{catalogue.settings.business_name} · Hotel · Lounge · Club · © 2026 1759 Empire</span></footer>
  </main>;
}

