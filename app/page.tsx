import Link from "next/link";
import CinematicVideo from "@/components/CinematicVideo";
import BralessContact1759 from "@/components/BralessContact1759";
import { getPublicMediaPosts } from "@/lib/media-posts";
import styles from "@/components/BralessCampaign.module.css";

const BRALESS_MEDIA_IDS = {
  flyer: "9687eb7b-0b24-4962-a01e-0bd04e50ad14",
  redCarpet: "b7e31730-db74-4ba0-9fd6-d6a9e8e6af08",
  videoOne: "eb9c6a93-5eff-4484-8339-4894184aab47",
  videoTwo: "6b569d63-6503-4672-8413-c340731f4e12",
  september: "c7375c02-45ff-4670-ae45-5e8c3ca860be",
} as const;

type MediaAsset = {
  id: string;
  public_url: string;
  storage_path?: string | null;
  media_type?: string | null;
  title?: string | null;
};

function findAsset(
  assets: MediaAsset[],
  id: string,
) {
  return assets.find(
    (asset) => asset.id === id,
  );
}

export default async function HomePage() {
  const { featured, videos } =
    await getPublicMediaPosts();

  const allAssets = [
    featured?.flyer,
    ...videos,
  ].filter(Boolean) as MediaAsset[];

  /*
   * ----------------------------------------------------------
   * VERIFIED LIVE SUPABASE MEDIA
   * ----------------------------------------------------------
   *
   * These IDs were taken directly from the live
   * public.media_assets records.
   *
   * TikTok / UltraSound is intentionally excluded.
   */

  const flyer =
    findAsset(
      allAssets,
      BRALESS_MEDIA_IDS.flyer,
    );

  const redCarpet =
    findAsset(
      allAssets,
      BRALESS_MEDIA_IDS.redCarpet,
    );

  const videoOne =
    findAsset(
      allAssets,
      BRALESS_MEDIA_IDS.videoOne,
    );

  const videoTwo =
    findAsset(
      allAssets,
      BRALESS_MEDIA_IDS.videoTwo,
    );

  const septemberVideo =
    findAsset(
      allAssets,
      BRALESS_MEDIA_IDS.september,
    );

  /*
   * Keep the existing campaign CTA source.
   */
  const whatsappUrl =
    featured?.cta_url ||
    "";

  const whatsappNumber =
    whatsappUrl.match(/wa\.me\/([^?]+)/)?.[1] ||
    "";

  /*
   * ----------------------------------------------------------
   * MEDIA ORDER
   * ----------------------------------------------------------
   *
   * 1. Flyer
   * 2. Red Carpet
   * 3. Video One
   * 4. Video Two
   * 5. 21 September Video
   *
   * TikTok is deliberately not included.
   */

  const mediaItems = [
    flyer
      ? {
          key: "flyer",
          type: "image" as const,
          src: flyer.public_url,
          alt: "Braless Party campaign flyer",
        }
      : null,

    redCarpet
      ? {
          key: "red-carpet",
          type: "video" as const,
          src: redCarpet.public_url,
          start: 34,
          end: 40,
          alt: "Braless red carpet atmosphere",
        }
      : null,

    videoOne
      ? {
          key: "video-one",
          type: "video" as const,
          src: videoOne.public_url,
          start: 74,
          end: 80,
          alt: "Braless nightlife and crowd energy",
        }
      : null,

    videoTwo
      ? {
          key: "video-two",
          type: "video" as const,
          src: videoTwo.public_url,
          start: 40,
          end: 49,
          alt: "Braless live performance and crowd",
        }
      : null,

    septemberVideo
      ? {
          key: "september-video",
          type: "video" as const,
          src: septemberVideo.public_url,
          start: 0,
          end: 13.4,
          alt: "Braless Festival promotional video",
        }
      : null,
  ].filter(Boolean) as Array<
    | {
        key: string;
        type: "image";
        src: string;
        alt: string;
      }
    | {
        key: string;
        type: "video";
        src: string;
        start: number;
        end: number;
        alt: string;
      }
  >;

  return (
    <main className={styles.page}>
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link
            href="/"
            className={styles.brand}
            aria-label="1759 Empire"
          >
            <img
              src="/assets/brand/1759-empire-logo-transparent.png"
              alt="1759 Empire"
            />
          </Link>

          <nav
            className={styles.nav}
            aria-label="Primary navigation"
          >
            <a
              href="#braless"
              className={styles.navActive}
            >
              BRALESS
            </a>

            <a href="#experience">
              EXPERIENCE
            </a>

            <a href="#media">
              MEDIA
            </a>

            <a href="#whats-next">
              WHAT&apos;S NEXT
            </a>
          </nav>

          {whatsappUrl && (
            <BralessContact1759
              whatsapp={whatsappNumber}
              showFloating
              ownsModal
            >
              CONTACT 1759
            </BralessContact1759>
          )}
        </div>
      </header>

      {/* =====================================================
          HERO
          ===================================================== */}

      <section
        id="braless"
        className={styles.hero}
      >
        <div className={styles.heroAtmosphere} />

        {videoOne && (
          <div className={styles.heroMotion}>
            <CinematicVideo
              src={videoOne.public_url}
              start={74}
              end={82.15}
              className={styles.heroMotionVideo}
              ariaLabel="Braless nightlife atmosphere"
            />
          </div>
        )}

        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              1759 EMPIRE PRESENTS
            </p>

            <h1>
              BRALESS
              <span>PARTY.</span>
            </h1>

            <p className={styles.heroTagline}>
              ONE YEAR. ONE NIGHT.
            </p>

            <div className={styles.heroMeta}>
              <span>
                26 SEPTEMBER 2026
              </span>

              <span>
                10 PM — LATE
              </span>

              <span>
                1759 EMPIRE LOUNGE
              </span>
            </div>

            {whatsappUrl && (
              <BralessContact1759 whatsapp={whatsappNumber} gold>
                CONTACT 1759
              </BralessContact1759>
            )}
          </div>

          <div className={styles.heroPoster}>
            {flyer && (
              <img
                src={flyer.public_url}
                alt="Braless Party campaign flyer"
              />
            )}
          </div>
        </div>

        <div className={styles.heroBottom}>
          <span>AKUTE · LAGOS</span>
          <span>1759 EMPIRE</span>
          <span>26.09.26</span>
        </div>
      </section>

      {/* =====================================================
          EXPERIENCE
          ===================================================== */}

      <section
        id="experience"
        className={styles.experience}
      >
        <div className={styles.sectionInner}>
          <div className={styles.experienceGrid}>
            <div className={styles.experienceCopy}>
              <p className={styles.eyebrow}>
                THE EXPERIENCE
              </p>

              <h2>
                ONE NIGHT.
                <br />
                NO ORDINARY
                <br />
                PARTY.
              </h2>

              <p className={styles.experienceLead}>
                BRALESS is the nightlife
                experience from 1759 Empire —
                built around music, energy,
                people and nights worth
                remembering.
              </p>

              <div className={styles.valueMarkers}>
                <div>
                  <span>01</span>
                  <strong>
                    GREAT MUSIC
                  </strong>
                </div>

                <div>
                  <span>02</span>
                  <strong>
                    AMAZING PEOPLE
                  </strong>
                </div>

                <div>
                  <span>03</span>
                  <strong>
                    PREMIUM VIBES
                  </strong>
                </div>

                <div>
                  <span>04</span>
                  <strong>
                    UNFORGETTABLE NIGHTS
                  </strong>
                </div>
              </div>
            </div>

            <div
              className={styles.experienceArtwork}
              aria-label="1759 Empire Braless nightlife"
            >
              <div
                className={
                  styles.experienceArtworkFrame
                }
              >
                <div
                  className={
                    styles.experienceArtworkImage
                  }
                />

                <div
                  className={
                    styles.experienceArtworkOverlay
                  }
                >
                  <span>
                    BRALESS
                  </span>

                  <span>
                    1759 EMPIRE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {videoOne && (
            <div
              className={
                styles.experienceFootage
              }
            >
              <CinematicVideo
                src={videoOne.public_url}
                start={42}
                end={47}
                ariaLabel="Braless nightlife footage"
              />

              <div
                className={
                  styles.experienceFootageOverlay
                }
              >
                <span>
                  MUSIC · PEOPLE · ENERGY
                </span>

                <span>
                  1759 EMPIRE
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          MEDIA
          ===================================================== */}

      <section
        id="media"
        className={styles.media}
      >
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>
                BRALESS MEDIA
              </p>

              <h2>
                SEE WHAT&apos;S
                <br />
                HAPPENING.
              </h2>
            </div>

            <p
              className={
                styles.sectionSideText
              }
            >
              Real moments. Real energy.
              Captured from the Braless
              experience.
            </p>
          </div>

          <div className={styles.mediaGrid}>
            {mediaItems.map((item) => (
              <article
                key={item.key}
                className={styles.mediaTile}
              >
                {item.type === "image" ? (
                  <img
                    src={item.src}
                    alt={item.alt}
                  />
                ) : (
                  <>
                    <CinematicVideo
                      src={item.src}
                      start={item.start}
                      end={item.end}
                      ariaLabel={item.alt}
                    />

                    <span
                      className={
                        styles.mediaPlay
                      }
                      aria-hidden="true"
                    >
                      ▶
                    </span>
                  </>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          WHAT'S NEXT
          ===================================================== */}

      <section
        id="whats-next"
        className={styles.whatsNext}
      >
        <div
          className={
            styles.whatsNextAtmosphere
          }
        />

        <div className={styles.sectionInner}>
          <div className={styles.whatsNextGrid}>
            <div className={styles.eventDetails}>
              <p className={styles.eyebrow}>
                WHAT&apos;S NEXT
              </p>

              <h2>
                YOUR NEXT
                <br />
                NIGHT OUT.
              </h2>

              <div
                className={
                  styles.eventDetailsList
                }
              >
                <div>
                  <span>DATE</span>

                  <strong>
                    26 SEPTEMBER 2026
                    <small>
                      SATURDAY
                    </small>
                  </strong>
                </div>

                <div>
                  <span>TIME</span>

                  <strong>
                    10 PM — LATE
                  </strong>
                </div>

                <div>
                  <span>VENUE</span>

                  <strong>
                    1759 EMPIRE LOUNGE
                    <small>
                      AKUTE · LAGOS
                    </small>
                  </strong>
                </div>
              </div>

              {whatsappUrl && (
                <BralessContact1759
                  whatsapp={whatsappNumber}
                  gold
                >
                  WHATSAPP TO RESERVE
                </BralessContact1759>
              )}
            </div>

            <div
              className={styles.hotelPanel}
            >
              <div
                className={styles.hotelPanelImage}
              />

              <div
                className={
                  styles.hotelPanelContent
                }
              >
                <p className={styles.eyebrow}>
                  COMING FOR BRALESS?
                </p>

                <h3>
                  STAY AT
                  <br />
                  1759 EMPIRE.
                </h3>

                <p>
                  Comfort. Class.
                  Convenience.
                  <br />
                  Make it a full experience.
                </p>

                {whatsappUrl && (
                  <BralessContact1759
                    whatsapp={whatsappNumber}
                    gold
                    className={styles.hotelCta}
                  >
                    BOOK YOUR ROOM
                  </BralessContact1759>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <img
              src="/assets/brand/1759-empire-logo-transparent.png"
              alt="1759 Empire"
            />
          </div>

          <div>
            BRALESS · AKUTE · LAGOS
          </div>

          <div>
            MUSIC. PEOPLE. NIGHTLIFE.
          </div>
        </div>
      </footer>
    </main>
  );
}