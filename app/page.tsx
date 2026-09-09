import Link from "next/link";
import Countdown from "@/components/Countdown";
import BrandedMedia from "@/components/BrandedMedia";
import GeneralEnquiryForm from "@/components/GeneralEnquiryForm";
import TrackedLink from "@/components/TrackedLink";
import TrackedWhatsAppLink from "@/components/TrackedWhatsAppLink";
import { findBralessEvent, getPublicCatalogue } from "@/lib/catalogue";

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
  const eventOfMonth = featuredEvent || catalogue.events[0] || { title: "Club Klass", image_url: "/assets/visual-assets/1759-empire-visual-assets/1001754455.jpg" };
  const bralessEvent = findBralessEvent(catalogue.events);
  const bralessCover = bralessEvent?.image_url || "/assets/visual-assets/1759-empire-visual-assets/1001754455.jpg";
  const bralessGallery = bralessEvent?.gallery && bralessEvent.gallery.length > 0 ? bralessEvent.gallery.slice(0, 2) : ["/media_stills/braless-performers-01.jpg", "/media_stills/braless-orisha-stage-01.jpg"];
  const displayedRooms = catalogue.rooms.length > 0 ? catalogue.rooms.map((room) => ({ id: room.id, name: room.name, price: room.price_per_night > 0 ? `₦${room.price_per_night.toLocaleString()}` : "", image: room.images[0] || "", fallback: room.images.length > 0 ? "" : "A calm place to land", note: room.amenities.join(" · ") || room.description || "Details available on request" })) : rooms;
  const mixcloudMixes = catalogue.media.filter((item) => item.platform === "mixcloud" && item.content_type === "dj_mix" && item.is_published && Boolean(item.external_url));
  const fromEmpireAssets = catalogue.media.filter((item) => ["event_highlight", "short", "event_recap", "event_teaser", "dj_clip", "dj_set"].includes(item.content_type || "website_media") && item.is_published && (Boolean(item.public_url) || Boolean(item.external_url))).slice(0, 4);
  const artists = catalogue.events.flatMap((event) => event.performer_socials || []).filter((artist) => Boolean(artist.instagram || artist.tiktok || artist.youtube || artist.mixcloud || artist.website));
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
      <div className="featuredEventCopy"><p className="eyebrow">{featuredEvent ? "EVENT OF THE MONTH" : "CLUB KLASS · EVENTS"}</p><h2>{featuredEvent ? <>{featuredEvent.title}<br /><em>is calling.</em></> : <>The next big night<br /><em>is calling.</em></>}</h2><p>{featuredEvent?.short_description || "Good music, full tables and a reason to make the night count."}</p>{featuredEvent?.show_countdown && <Countdown date={featuredEvent.event_date} time={featuredEvent.event_time} />}<div className="actions">{featuredEvent?.slug ? <TrackedLink className="button" href={`/events/${featuredEvent.slug}${campaignSuffix}`} eventName="event_cta_clicked">Explore event</TrackedLink> : <TrackedLink className="button" href={`/events${campaignSuffix}`} eventName="event_cta_clicked">See what's on</TrackedLink>}{catalogue.settings.whatsapp_number ? <TrackedWhatsAppLink className="textLink" context="featured_event" href={`https://wa.me/${catalogue.settings.whatsapp_number}?text=${encodeURIComponent("Hello 1759 Empire, I would like to make an event enquiry.")}`}>Event enquiry</TrackedWhatsAppLink> : <Link className="textLink" href={`/book${campaignSuffix}`}>Event enquiry</Link>}</div></div><BrandedMedia className="featuredEventMedia" src={eventOfMonth.image_url || "/assets/visual-assets/1759-empire-visual-assets/1001754455.jpg"} alt={eventOfMonth.title || "Club Klass signature night"} fallback="The night starts here" />
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
      <div className="bralessMedia"><img src={bralessCover} alt={bralessEvent?.title || "Braless Party at 1759 Empire"} /></div>
      <div className="bralessCopy"><p className="eyebrow">A RECURRING 1759 EXPERIENCE</p><h2>Braless<br /><em>Party.</em></h2><p>{bralessEvent?.short_description || "A recognizable 1759 night built around atmosphere, music and a room full of energy."}</p><Link className="button" href={bralessEvent?.slug ? `/events/${bralessEvent.slug}` : "/events"}>See what's happening</Link></div>
      <div className="bralessDetail"><img src={bralessGallery[0]} alt={bralessEvent?.title || "Braless Party performers at 1759 Empire"} /><img src={bralessGallery[1]} alt={bralessEvent?.title || "Braless Party stage at 1759 Empire"} /></div>
    </section>

    <section className="viewingCentre"><div className="viewingCopy"><p className="eyebrow">LOUNGE · VIEWING CENTRE</p><h2>Watch the game.<br/><em>Meet your people.</em></h2><p>{catalogue.settings.lounge_description}</p><a className="button" href="#contact">Plan your visit</a></div><BrandedMedia className="viewingMedia" src="/media_stills/night-crowd-02.jpg" fallback="Big screens. Good company." alt="Nightlife atmosphere at 1759 Empire" /></section>

    {catalogue.settings.show_events_section && <section id="events" className="events">
      <div className="sectionHead"><div><p className="eyebrow">WHAT'S ON</p><h2>Events made<br/><em>for the night.</em></h2></div></div>
      <div className="eventCard">
          <BrandedMedia className="eventMedia" src={featuredEvent?.image_url} alt={featuredEvent?.title || "Club Klass event"} fallback={featuredEvent ? "A night worth making" : "Club Klass events"}><span>{featuredEvent?.title || "Club Klass"}</span></BrandedMedia>
          <div className="eventInfo"><p className="eventLabel">CLUB KLASS · EVENT</p><h3>{featuredEvent?.title || "The next big night"}</h3><p>{featuredEvent?.description || "Good music, full tables and a reason to make the night count."}</p>{featuredEvent?.slug ? <Link className="textLink dark" href={`/events/${featuredEvent.slug}`}>Explore event →</Link> : <a className="textLink dark" href="#contact">Event enquiries →</a>}</div>
      </div>
    </section>}

    {mixcloudMixes.length > 0 && <section className="mixesSection"><div className="sectionHead"><div><p className="eyebrow">1759 MIXES</p><h2>The sound of 1759 Empire.</h2></div></div><div className="mixGrid">{mixcloudMixes.map((mix) => <article className="mixCard" key={mix.id}><a href={mix.external_url ?? mix.public_url ?? "#"}><img src={mix.thumbnail_url ?? mix.public_url ?? "/assets/visual-assets/1759-empire-visual-assets/1001754455.jpg"} alt={mix.title || "1759 Mix"} /><strong>{mix.title}</strong><span>{mix.platform} · {mix.content_type}</span><p>{mix.caption || mix.social_caption || "The sound of 1759 Empire."}</p></a></article>)}</div></section>}
    {fromEmpireAssets.length > 0 && <section className="fromEmpireSection"><div className="sectionHead"><div><p className="eyebrow">FROM THE EMPIRE</p><h2>Short-form / event highlights.</h2></div></div><div className="highlightGrid">{fromEmpireAssets.map((asset) => <article className="highlightCard" key={asset.id}><a href={asset.external_url ?? asset.public_url ?? "#"}><img src={asset.thumbnail_url ?? asset.public_url ?? "/assets/visual-assets/1759-empire-visual-assets/1001754455.jpg"} alt={asset.title || asset.category || "1759 Empire highlight"} /><span>{asset.content_type}</span><strong>{asset.title}</strong><p>{asset.caption}</p></a></article>)}</div></section>}
    {artists.length > 0 && <section className="artistsSection"><div className="sectionHead"><div><p className="eyebrow">FOLLOW THE ARTISTS</p><h2>DJ and artist links.</h2></div></div><div className="artistGrid">{artists.map((artist, index) => <article className="artistCard" key={`${artist.name}-${index}`}>{artist.name && <strong>{artist.name}</strong>}{artist.instagram && <a href={artist.instagram ?? "#"}>Instagram</a>}{artist.tiktok && <a href={artist.tiktok ?? "#"}>TikTok</a>}{artist.youtube && <a href={artist.youtube ?? "#"}>YouTube</a>}{artist.mixcloud && <a href={artist.mixcloud ?? "#"}>Mixcloud</a>}{artist.website && <a href={artist.website ?? "#"}>Website</a>}</article>)}</div></section>}
    {catalogue.media.some((item) => item.content_type === "event_recap" && item.is_published) && <section className="reliveSection"><div className="sectionHead"><div><p className="eyebrow">RELIVE THE NIGHT</p><h2>Post-event highlights and recaps.</h2></div></div><div className="reliveGrid">{catalogue.media.filter((item) => item.content_type === "event_recap" && item.is_published).slice(0, 3).map((item) => <article className="reliveCard" key={item.id}><a href={item.external_url ?? item.public_url ?? "#"}><img src={item.thumbnail_url ?? item.public_url ?? "/assets/visual-assets/1759-empire-visual-assets/1001754455.jpg"} alt={item.title || "1759 recap"} /><strong>{item.title}</strong><p>{item.caption}</p></a></article>)}</div></section>}
    <section className="galleryIntro"><p className="eyebrow">THE ATMOSPHERE</p><h2>See the night.<br/><em>Then come experience it.</em></h2><div className="momentStrip"><BrandedMedia src="/media_stills/night-crowd-01.jpg" fallback="Stay" alt="1759 Empire nightlife"/><BrandedMedia src="/media_stills/sound-dj-01.jpg" fallback="Dine" alt="DJ performance at 1759 Empire"/><BrandedMedia src="/media_stills/night-performer-01.jpg" fallback="Late nights" alt="Performer at 1759 Empire"/></div><p>Hotel calm, open-air energy and Club Klass after dark, all in one destination.</p></section>
    <section id="contact" className="contact">
      <div><p className="eyebrow">FIND US</p><h2>{catalogue.settings.address}</h2><p>{catalogue.settings.contact_cta}</p><p>{catalogue.settings.phone || catalogue.settings.booking_contact}{catalogue.settings.email ? ` · ${catalogue.settings.email}` : ""}</p><div className="actions"><TrackedLink className="button" href="/book" eventName="booking_cta_clicked">Check room availability</TrackedLink>{catalogue.settings.whatsapp_number ? <TrackedWhatsAppLink className="textLink dark" context="contact" href={`https://wa.me/${catalogue.settings.whatsapp_number}?text=${encodeURIComponent("Hello 1759 Empire, I'd like to make an enquiry.")}`}>WhatsApp us</TrackedWhatsAppLink> : <Link className="textLink dark" href="/book">Contact 1759</Link>}</div></div>
      <GeneralEnquiryForm whatsapp={catalogue.settings.whatsapp_number} />
    </section>

    <footer><img src="/assets/brand/1759-empire-logo.webp" alt={catalogue.settings.business_name}/><span>{catalogue.settings.business_name} · Hotel · Lounge · Club · © 2026 1759 Empire</span></footer>
  </main>;
}

