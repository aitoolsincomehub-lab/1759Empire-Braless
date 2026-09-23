
Today 5:35 PM

Grandessa_Official_Deployment_Certificate.pdf
PDF
Why the black and red patches at top left and bottom right? Also make it classy premium

Yes — those black/red patches were decorative blocks from the first design, and they make the certificate look more like a template than a premium corporate document.

I rebuilt it with:

No black/red corner patches

Clean navy + champagne-gold luxury palette

Fine double border and restrained corner detailing

More elegant typography

Proper spacing and hierarchy

Subtle 1759 watermark

Premium circular OFFICIALLY LIVE seal

Your two logos retained

Same deployment dates: 20 September 2026 → 20 September 2027

Same MD/CEO names and domain

I also kept the structure inspired by the Grandessa example, which uses a formal deployment certificate with launch date, status, expiry and signatures. 


Premium version
Download the 1759 Empire Premium Deployment Certificate PDF

This one is much closer to the hotel/luxury corporate standard rather than a generic certificate. 


1759_Empire_Official_Deployment_Certificate_Premium.pdf
PDF


Today 7:36 PM

1759_Empire_Certificate_of_Official_Deployment-1.pdf
PDF
Please change the color to something more premium and make the calligraphy more eligible I can't understand what is written. Make the certificate professional corporate

Yes. I changed the direction substantially.

The uploaded version had a luxury/nightlife look, but for an official corporate deployment certificate it was too decorative, and the script-style names were genuinely difficult to read. 


I rebuilt it as a corporate luxury certificate:

Midnight navy + champagne gold + ivory

No bright red as a dominant design colour

No excessive starbursts/confetti

No illegible calligraphy

1759 Empire uses an elegant but readable serif italic

Both signature names are clearly readable

Cleaner corporate information band

More restrained official seal

Better spacing and hierarchy

Your Empire and Bojo Tech logos retained

Domain, launch date, status and expiry retained exactly

I also kept the design philosophy to a limited palette and restrained typography, which is consistent with current professional certificate design guidance. 

Download the corporate version
Download — 1759 Empire Corporate Official Deployment Certificate

This is the direction I would use for an official document you can print, frame, email to the client, or keep in the company's deployment records. 


1759_Empire_Official_Deployment_Certificate_Corporate.pdf
PDF


1001798728.jpg
1001798734.jpg

Grandessa_Official_Deployment_Certificate(2).pdf
PDF
The deployment partner no use title I arrow to. And the gold live badge looks better. Your the the one who made that too for grandessa

Yes — I see exactly what you mean now.

The Grandessa certificate is the right reference for the structure. The important difference is the bottom section:

Bojo Tech Global Services

DEVELOPED & DEPLOYED BY

Technology Partner

—not “MD / CEO · Deployment Partner.” The Grandessa version clearly uses that hierarchy. 


I also brought back the gold “OFFICIALLY LIVE” badge with the ribbon treatment, because that gives the certificate a much more authoritative feel.

Final version
Download the revised 1759 Empire Corporate Certificate

Changes made:

🏅 Larger gold official LIVE seal with ribbons

Bojo Tech: “DEVELOPED & DEPLOYED BY / Technology Partner”

Michael Ademola: “MD / CEO / 1759 Empire Lounge, Hotel & Suites”

Readable elegant typography instead of difficult calligraphy

Navy + champagne-gold + ivory corporate palette

Better balanced spacing

No red/black decorative blocks

Logos safely positioned inside the page margins

Keeps the official deployment information and one-year validity

The navy/gold corporate direction is also consistent with common professional certificate layouts; current professional certificate template collections include navy/white and navy/gold corporate styles. 

This is the version I would use for the actual client certificate. 


1759_Empire_Official_Deployment_Certificate_Final.pdf
PDF



Pasted code(20260920-193714).css
File
import Link from "next/link"; 
import MediaPostCard from "@/components/MediaPostCard"; 
import { getPublicMediaPosts } from "@/lib/media-posts"; 
import styles from "@/components/BralessCampaign.module.css"; 
 
export default async function HomePage() { 
  const { featured, videos } = await getPublicMediaPosts(); 
 
  const campaign = featured; 
  const whatsappUrl = campaign?.cta_url || ""; 
 
  return ( 
    <main className={styles.page}> 
      {/* Temporary mobile campaign overview. 
          It gives the visitor a quick cinematic view of the full campaign 
          before transitioning into the mobile layout. */} 
      <div className={styles.mobileIntro} aria-hidden="true"> 
        <div className={styles.mobileIntroBrand}>BRALESS</div> 
 
        <div className={styles.mobileIntroGrid}> 
          {campaign?.flyer?.public_url && ( 
            <div className={styles.mobileIntroFlyer}> 
              <img src={campaign.flyer.public_url} alt="" /> 
            </div> 
          )} 
 
          {videos.slice(0, 4).map((video) => ( 
            <div className={styles.mobileIntroVideo} key={video.id}> 
              <video 
                src={video.public_url} 
                autoPlay 
                muted 
                loop 
                playsInline 
                preload="metadata" 
              /> 
            </div> 
          ))} 
        </div> 
 
        <div className={styles.mobileIntroBottom}> 
          <span>ONE YEAR. ONE NIGHT.</span> 
          <span>26 SEPTEMBER 2026</span> 
        </div> 
      </div> 
 
      <header className={styles.header}> 
        <div className={styles.headerInner}> 
          <Link href="/" className={styles.brand}> 
            BRALESS 
          </Link> 
 
          <nav className={styles.nav} aria-label="Primary navigation"> 
            <a href="#experience">Experience</a> 
            <a href="#media">Media</a> 
            <a href="#whats-next">What&apos;s Next</a> 
          </nav> 
 
          {whatsappUrl && ( 
            <a 
              className={styles.headerCta} 
              href={whatsappUrl} 
              target="_blank" 
              rel="noreferrer" 
            > 
              WHATSAPP TO RESERVE 
            </a> 
          )} 
        </div> 
      </header> 
 
      <section className={styles.hero}> 
        <div className={styles.heroInner}> 
          <div className={styles.heroCopy}> 
            <p className={styles.eyebrow}>1759 EMPIRE PRESENTS</p> 
 
            <h1> 
              BRALESS 
              <span>PARTY.</span> 
            </h1> 
 
            <p className={styles.heroTagline}>ONE YEAR. ONE NIGHT.</p> 
 
            <div className={styles.heroMeta}> 
              <span>26 SEPTEMBER 2026</span> 
              <span>10 PM — LATE</span> 
              <span>1759 EMPIRE LOUNGE</span> 
            </div> 
 
            {whatsappUrl && ( 
              <a 
                href={whatsappUrl} 
                className={styles.primaryCta} 
                target="_blank" 
                rel="noreferrer" 
              > 
                WHATSAPP TO RESERVE 
              </a> 
            )} 
          </div> 
 
          {campaign && ( 
            <div className={styles.heroCampaign}> 
              <MediaPostCard post={campaign} featured /> 
            </div> 
          )} 
        </div> 
 
        <div className={styles.heroBottomGlow} aria-hidden="true" /> 
      </section> 
 
      <section id="experience" className={styles.section}> 
        <div className={styles.sectionInner}> 
          <div className={styles.sectionHeading}> 
            <div> 
              <p className={styles.eyebrow}>THE EXPERIENCE</p> 
 
              <h2> 
                ONE NIGHT. 
                <br /> 
                NO ORDINARY PARTY. 
              </h2> 
            </div> 
 
            <p className={styles.sectionSideText}> 
              BRALESS is the nightlife experience from 1759 Empire — built 
              around music, energy, people and nights worth remembering. 
            </p> 
          </div> 
 
          <div className={styles.valueMarkers}> 
            <span>GREAT MUSIC</span> 
            <span>AMAZING PEOPLE</span> 
            <span>PREMIUM VIBES</span> 
            <span>UNFORGETTABLE NIGHTS</span> 
          </div> 
 
          {videos[0] && ( 
            <div className={styles.experienceVisual}> 
              <video 
                src={videos[0].public_url} 
                autoPlay 
                muted 
                loop 
                playsInline 
                preload="metadata" 
                aria-label="Braless nightlife atmosphere" 
              /> 
 
              <div className={styles.experienceOverlay}> 
                <span>BRALESS</span> 
                <span>1759 EMPIRE</span> 
              </div> 
            </div> 
          )} 
        </div> 
      </section> 
 
      <section id="media" className={styles.sectionAlt}> 
        <div className={styles.sectionInner}> 
          <div className={styles.sectionHeading}> 
            <div> 
              <p className={styles.eyebrow}>BRALESS MEDIA</p> 
 
              <h2> 
                SEE WHAT&apos;S 
                <br /> 
                HAPPENING. 
              </h2> 
            </div> 
 
            <p className={styles.sectionSideText}> 
              The night, the people, the energy — captured as it happens. 
            </p> 
          </div> 
 
          <div className={styles.mediaGrid}> 
            {campaign?.flyer && ( 
              <MediaPostCard 
                post={campaign} 
                asset={campaign.flyer} 
              /> 
            )} 
 
            {videos.map((video) => ( 
              <MediaPostCard 
                key={video.id} 
                asset={video} 
              /> 
            ))} 
          </div> 
        </div> 
      </section> 
 
      <section id="whats-next" className={styles.details}> 
        <div className={styles.sectionInner}> 
          <p className={styles.eyebrow}>WHAT&apos;S NEXT</p> 
 
          <h2> 
            YOUR NEXT 
            <br /> 
            NIGHT OUT. 
          </h2> 
 
          <div className={styles.detailsGrid}> 
            <div> 
              <span>DATE</span> 
              <strong> 
                26 SEPTEMBER 2026 
                <small>SATURDAY</small> 
              </strong> 
            </div> 
 
            <div> 
              <span>TIME</span> 
              <strong>10 PM — LATE</strong> 
            </div> 
 
            <div> 
              <span>VENUE</span> 
              <strong> 
                1759 EMPIRE LOUNGE 
                <small>AKUTE · LAGOS</small> 
              </strong> 
            </div> 
          </div> 
 
          {whatsappUrl && ( 
            <a 
              href={whatsappUrl} 
              className={styles.primaryCta} 
              target="_blank" 
              rel="noreferrer" 
            > 
              WHATSAPP TO RESERVE 
            </a> 
          )} 
        </div> 
      </section> 
 
      <section className={styles.hotelBridge}> 
        <div className={styles.sectionInner}> 
          <div className={styles.hotelBridgeInner}> 
            <div> 
              <p className={styles.eyebrow}>COMING FOR BRALESS?</p> 
 
              <h2> 
                STAY AT 
                <br /> 
                1759 EMPIRE. 
              </h2> 
 
              <p> 
                Comfort. Class. Convenience. 
                <br /> 
                Make it a full experience. 
              </p> 
            </div> 
 
            {whatsappUrl && ( 
              <a 
                href={whatsappUrl} 
                className={styles.hotelCta} 
                target="_blank" 
                rel="noreferrer" 
              > 
                BOOK YOUR ROOM 
              </a> 
            )} 
          </div> 
        </div> 
      </section> 
 
      <footer className={styles.footer}> 
        <div className={styles.sectionInner}> 
          <strong>1759 EMPIRE</strong> 
 
          <span>BRALESS · AKUTE · LAGOS</span> 
 
          <span>Music. People. Nightlife. 1759 Empire.</span> 
        </div> 
      </footer> 
    </main> 
  ); 
}      you can check history and confirm the dimensions and contrasts shades of the images you gave me to download. 


braless-16-assets.zip.zip
Zip Archive


braless source filesSep 18, 2026, 03_19_32 PM.zip
Zip Archive

Yes. I have the exact five source files now, and this was absolutely worth doing.

I’ve inspected the actual footage rather than just the filenames. I can surgically choose moments; we don't need to use each video as one continuous generic loop.

My first read of the footage
1. braless video one — 476×848, 82.58s

This is the strongest all-round Braless footage.

It contains exactly the energy you were talking about:

women dancing / enjoying themselves

attractive nightlife moments

people interacting

drinks

crowd movement

individual personality

genuine party atmosphere

I already see several useful sequences.

For example, around 40–45s, there are much more intimate/fun individual-party moments, while around 70–78s the footage moves into stronger group/crowd energy.

This is likely going to be one of our primary Experience/Media sources.

2. braless red carpet — 478×850, 50.03s

This is valuable for the luxury / seductive / red-carpet side.

There are sequences of women posing together, individual women, group shots and red-carpet interaction.

This shouldn't be treated like a random party video. It gives us the fashion/luxury layer that balances the more chaotic nightlife footage.

3. braless video two — 848×478, 90.01s

This one is completely different because it's landscape.

It's heavily oriented toward:

live musicians

performance

stage

crowd

instruments

wider room energy

That's actually useful.

I wouldn't crop this aggressively into a portrait tile. This is a candidate for a wide cinematic section/background, especially Experience.

4. braless video tiktok — 576×1024, 71.67s

This has some of the most visually provocative/nightlife material.

There are women dancing and some stronger sensual nightlife moments.

BUT: it carries prominent ULTRASOUND / TikTok branding and watermarks throughout parts of the footage.

So I'm not going to blindly put this behind the Braless hero. It could make the site look like we're advertising another campaign.

It may still have usable sections where the branding can be cropped/obscured, but I'll treat it as a secondary source, not automatically promote it to hero material.

And the flyer is confirmed
The flyer is:

1672 × 941

and visually it already establishes the exact language we wanted:

black → deep red → gold → confident feminine imagery → luxury/nightlife.

So the artwork we generated and this flyer are actually speaking the same visual language.

The important part
I don't want to just say:

Video 1 → Experience
Video 2 → Media
etc.

We can do something considerably better.

I'm going to build the page as a visual sequence:

HERO
Flyer / campaign identity

↓

subtle moving nightlife atmosphere

↓

human movement

↓

Braless party artwork

↓

headline

The movement should feel like the page is alive behind the typography, rather than like somebody embedded a TikTok.

EXPERIENCE
This is where I want the more provocative/fun material:

woman enjoying herself → crowd → DJ/live performance → party-girls artwork

The important thing is not showing everything simultaneously.

The viewer should discover things as their eye moves across the section.

MEDIA
Here we can be much more direct:

real footage → real people → real party → red carpet → performance

That's where the raw social proof belongs.

WHAT'S NEXT
Almost no chaotic footage.

This section should breathe and return to:

gold / black / red / luxury.

HOTEL BRIDGE
Again, no party chaos.

That's the transition from:

“I want to go to this party.”

to

“I should stay at 1759 Empire.”

One thing I want to change from our earlier plan
Now that I've actually seen the videos, I don't think we should force all four videos into the Hero.

That would actually weaken the cinematic effect.

The footage is much stronger when we give each type of footage a job.

And the really good news is:

we have enough material to create that contrast.

The MDN media API also supports seeking to precise playback positions, so technically we can control where a video starts rather than being forced to begin every loop at 0s. 

So yes — I can surgically pick the moments.

And I'm now going to treat the footage according to the actual material I see, including the girls having fun / confident sensuality / crowd energy you specifically asked for, rather than making everything artificially “clean.”


very good if you dont want to use all videos or even 16 assets blindly or needlessly i agree if 1 can serve multiple areas its a welcome treasured move. so rather than 8 how many can you use? and know its great and not crowded or busy or aimlessy crafted?

Yes. I would deliberately use fewer. Now that we've seen the actual footage, I would not try to place all 16 assets + all 4 videos. That would start looking like a design exercise instead of a premium campaign.

My recommendation: 9 unique visual sources
Not 9 per section — 9 across the entire page, with some reused intelligently.

Source	Primary job	Possible secondary use
Flyer	Hero campaign anchor	Media
Video One	Experience / real party energy	Media
Red Carpet video	Luxury + women/social energy	Media
Landscape Video Two	Wide performance/crowd atmosphere	Experience
Hero Atmosphere PNG	Hero depth	—
Party Girls PNG	Hero/Experience foreground	—
DJ Universe PNG	Experience personality	—
What's Next atmosphere PNG	What's Next	—
Hotel Bridge atmosphere PNG	Hotel transition	—
What I would not use initially
I would leave these out of the first finished version:

nightlife crowd silhouette

experience-party-right

experience-section-artwork

gold liquid

media atmosphere

champagne

gold/red corner

gold/red frame

silk swoosh

section frame

luxury dark frame

TikTok video as a major visual

Not because they're bad.

Because restraint is part of the design.

We already have enough visual information.

The actual composition I'd build
1. HERO — 4 visual ingredients
Flyer + Hero Atmosphere + Party Girls + extremely controlled video movement

The flyer is the campaign identity.

The atmosphere gives depth.

The girls give the hero a human focal point.

A carefully selected video moment can provide subliminal movement.

That's enough.

No DJ cutout. No gold splash. No crowd silhouette.

Otherwise the hero becomes:

“Look at all the things we generated.”

Instead of:

“What the hell is this? I want to see more.”

2. EXPERIENCE — 4 ingredients
This is where we can get slightly more aggressive.

Video One
→ actual people having fun

Landscape Video Two
→ performance / crowd / music

DJ Universe PNG
→ graphic personality

Party Girls PNG reused very subtly
→ visual continuity from Hero

This section becomes the energy section.

And importantly, the TikTok video isn't needed here if Video One already gives us better footage.

3. MEDIA — actual media
Here I want:

Flyer + Video One + Red Carpet + Video Two

Potentially TikTok as the fourth/fifth tile only if the relevant crop doesn't expose distracting branding.

This is where the user should think:

"These guys actually have a nightlife culture."

Not:

"Someone designed some cool graphics."

4. WHAT'S NEXT
One atmosphere image.

That's it.

Slow movement.

Large typography.

Gold/red light.

No girls.
No DJ.
No video.

This creates the breathing space that makes the previous section feel bigger.

5. HOTEL BRIDGE
One hotel atmosphere image.

Again:

minimal.

Luxury.

Slow movement.

The party stops here and the hotel becomes the solution.

So the visual count becomes
Unique major sources
5 artwork/atmosphere assets
+
3 useful videos
+
1 flyer

= 9

But the page won't look like nine different things.

Because several of those are background/depth layers, not competing foreground objects.

That's an important distinction.

And I want to protect one thing
The page should have visual silence.

You don't need an image in every empty corner.

The eye needs somewhere to rest before the next visual hit.

That's also better technically: video and large imagery are among the heavier resources on a page, and unnecessary animation/media increases processing and loading cost. 

So I'm actually more confident now than before that we shouldn't use the 16 blindly.

My target
Hero: cinematic
Experience: sexy + energetic + human
Media: real nightlife proof
What's Next: luxury breathing room
Hotel: aspiration/transition

No clutter. No gallery-wall effect. No “AI artwork everywhere.”

And yes, one asset serving two areas is a win, provided its second appearance has a different scale/crop/treatment so it feels like visual continuity rather than duplication.

That's the direction I'd lock.


can you finally confidently rewrite in full the css and if needed page tsx and if needed mediareportcard etc? we absolutely cannot expect copilot to make progress like you have, certain times words are just not enough to steer copilot.. please send the full rewritten corrections and calculated matches. 



Called tool


Called tool


Called tool


Called tool
Yes. Now I’m confident enough to lock it. We have the actual artwork, the actual flyer, the actual four videos, the exact current page.tsx, and the current CSS geometry.

I made one important architectural decision:

MediaPostCard does not need to control this page anymore.
For Braless, the page needs deliberate video windows, and HTMLMediaElement.currentTime lets us seek to exact positions and loop a selected range. 

I therefore built a small CinematicVideo component specifically for this campaign.

The final visual map
9 unique sources — not 16 thrown everywhere.

Flyer

Hero atmosphere

Party girls

Video One

Red Carpet

Video Two

DJ Universe

What's Next atmosphere

Hotel Bridge atmosphere

TikTok/UltraSound is deliberately excluded from the main composition because its persistent branding competes with Braless.

Exact video windows
Video	Location	Time
Video One	Hero background	74.0–82.15s
Video One	Experience	42.0–47.0s
Video One	Media	74.0–80.0s
Red Carpet	Media	34.0–40.0s
Video Two	Media	40.0–49.0s
This gives us women having fun, confident nightlife energy, crowd movement, red-carpet/luxury energy and live-performance atmosphere without turning the page into a visual traffic jam.

Files I've prepared
1. Full CSS — current CSS preserved + final authoritative cinematic corrections

Download the final Braless CSS

Replace your existing:

components/BralessCampaign.module.css
with it.

2. Full replacement page.tsx

Download the final page.tsx

This removes the dependency on MediaPostCard for this particular page and gives us direct control over the cinematic composition.

3. New CinematicVideo.tsx

Download CinematicVideo.tsx

Put it at:

components/CinematicVideo.tsx
4. Media/design report

Download the Braless cinematic media report

What the rewritten page actually does
HERO
The layering is now:

Hero atmosphere
      ↓
Video One — 74.0–82.15
      ↓
Flyer
      ↓
dark cinematic grading
      ↓
Party Girls artwork
      ↓
BRALESS PARTY typography
So the flyer remains the campaign identity while real nightlife footage is moving underneath it.

The party-girls artwork is not just dumped into the corner. It occupies the calculated right-side focal zone.

EXPERIENCE
This is intentionally less cluttered:

BIG TYPOGRAPHY
       +
REAL PARTY VIDEO — 42–47s
       +
subtle Party Girls continuity
       +
very restrained DJ artwork
The DJ artwork is only 16% opacity on desktop.

That's deliberate.

You should feel it before consciously noticing it.

MEDIA
Only four pieces:

FLYER
RED CARPET
VIDEO ONE
VIDEO TWO
No decorative artwork over the media.

The actual event footage gets to sell the experience.

WHAT'S NEXT
One image.

Slow movement.

Large typography.

Nothing else fighting it.

HOTEL BRIDGE
One hotel atmosphere.

Very slow horizontal movement.

The visual story changes from:

“I want to attend.”

to:

“I should stay here.”

One thing I especially like about this version
We're reusing Video One intelligently.

It doesn't mean the visitor sees the same thing three times.

The browser is being shown different portions of the same source:

Hero → late crowd/energy sequence

Experience → human/fun sequence

Media → late-party sequence again in a different crop

Because the role, crop and surrounding design are different, it becomes visual continuity, not repetition.

The CinematicVideo component handles those time windows directly rather than relying on the video always starting from zero. 

Don't touch
Supabase

media database

storage

booking system

admin

authentication

MediaPostCard.tsx

dependencies

package.json

Vite/Next configuration

MediaPostCard can remain in the project for other areas. We're simply not making it responsible for this highly art-directed Braless page anymore.

And I would not run a broad redesign prompt through Copilot now. Give it these three concrete files and tell it to replace the existing files exactly. This is precisely the sort of task where giving Copilot the finished implementation is safer than trying to describe the visual intention in another 50 paragraphs.


BralessCampaign.module.FINAL.css
Code


page.tsx
Code


BralessCinematicVideo.tsx
Code

1 more

Library
/
Braless_Cinematic_Media_Report.md


BRALESS 1759 — Final Cinematic Media Map
Selected production sources
The finished composition intentionally uses 9 unique visual sources across the page:

Campaign flyer — hero anchor + media

Hero atmosphere PNG — hero depth

Party girls PNG — hero focal art + subtle Experience continuity

Video One — real party / women / crowd energy

Red Carpet video — luxury/social/feminine energy

Video Two — wide live-performance/crowd energy

DJ Universe PNG — restrained Experience personality

What's Next hotel atmosphere — quiet luxury

Hotel Bridge atmosphere — party-to-stay transition

The TikTok/UltraSound video is deliberately not promoted into the final composition because its repeated UltraSound/TikTok branding competes with the permanent Braless brand.

Exact video windows
Video One — 82.579688s, portrait
HERO: 74.0s → 82.15s

Crowd, women, movement and nightlife energy.

Low-opacity background treatment behind the flyer.

EXPERIENCE: 42.0s → 47.0s

Stronger human/fun sequence without turning the section into a collage.

MEDIA: 74.0s → 80.0s

Reuses the same strong crowd-energy region with a different crop.

Red Carpet — 50.033333s, portrait
MEDIA: 34.0s → 40.0s

Red-carpet group/women/luxury social energy.

Kept as a media tile rather than placed behind the main hero copy.

Video Two — 90.013021s, landscape
MEDIA: 40.0s → 49.0s

Wide crowd/live-performance sequence.

Landscape source is preserved as a cinematic crop instead of being forced into portrait proportions.

TikTok / UltraSound — 71.666667s, portrait
Not used in the final page composition.

Reason: persistent third-party/event branding and watermarking compete with the Braless identity.

Asset geometry used
Hero atmosphere: 1672×941 (16:9 class)

Party girls: 1536×1024 (3:2)

DJ Universe: 1289×1221 (~1.06:1)

What's Next atmosphere: 1774×887 (~2:1)

Hotel Bridge atmosphere: 1671×941 (~16:9)

Flyer: 1672×941 (~16:9)

Intended visual hierarchy
HERO

Dominant: flyer + headline

Supporting: moving Video One + hero atmosphere

Focal accent: party-girls artwork

EXPERIENCE

Dominant: typography + real Video One footage

Supporting: restrained party-girls continuity

Accent: low-opacity DJ artwork

MEDIA

Dominant: actual flyer + three selected real videos

No decorative asset overlays

WHAT'S NEXT

One subdued hotel atmosphere only

Slow movement, text remains dominant

HOTEL BRIDGE

One hotel atmosphere only

Slow horizontal reveal

Design constraint
Do not add the remaining artwork simply because it exists. The unused assets remain available for a later campaign revision, CMS experimentation, or a specific section if a real visual gap appears.

