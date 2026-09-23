import type { MediaAsset, MediaPost } from "@/types";
import styles from "./BralessCampaign.module.css";

interface MediaPostCardProps {
  post?: MediaPost;
  featured?: boolean;
  asset?: MediaAsset;
}

function dateLabel(value?: string | null) {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .toUpperCase();
}

function timeLabel(value?: string | null) {
  if (!value) return "";

  const [hours, minutes] = value.split(":");
  const hour = Number(hours);

  if (Number.isNaN(hour)) {
    return value;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
}

function isVideo(asset?: MediaAsset | null) {
  return asset?.media_type === "video";
}

export default function MediaPostCard({
  post,
  featured = false,
  asset,
}: MediaPostCardProps) {
  if (asset) {
    return (
      <article
        className={`${styles.mediaTile} ${
          featured ? styles.mediaTileFeatured : ""
        }`}
      >
        {isVideo(asset) ? (
          <video
            src={asset.public_url}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={asset.public_url}
            alt={asset.alt_text || asset.title || "Braless"}
          />
        )}

        <div className={styles.mediaTileShade} />

        <div className={styles.mediaTileLabel}>
          {isVideo(asset) ? "BRALESS VIDEO" : "BRALESS"}
        </div>
      </article>
    );
  }

  if (!post) {
    return null;
  }

  const flyer = post.flyer;
  const foregroundVideo = post.foreground_video;
  const backgroundVideo = post.background_video;

  return (
    <article
      className={`${styles.campaignCard} ${
        featured ? styles.campaignCardFeatured : ""
      }`}
    >
      <div className={styles.campaignVisual}>
        {backgroundVideo?.public_url && (
          <video
            className={styles.backgroundVideo}
            src={backgroundVideo.public_url}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        )}

        <div className={styles.visualShade} />
        <div className={styles.visualGlow} />

        {flyer?.public_url ? (
          <img
            className={styles.flyer}
            src={flyer.public_url}
            alt={flyer.alt_text || "Braless anniversary flyer"}
          />
        ) : foregroundVideo?.public_url ? (
          <video
            className={styles.foregroundVideo}
            src={foregroundVideo.public_url}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <div className={styles.mediaPlaceholder}>BRALESS</div>
        )}

        {foregroundVideo?.public_url && flyer?.public_url && (
          <video
            className={styles.foregroundClip}
            src={foregroundVideo.public_url}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        )}

        <div className={styles.mediaLabel}>1759 EMPIRE PRESENTS</div>
      </div>

      <div className={styles.campaignCopy}>
        <div className={styles.copyMeta}>
          <span>{post.event_name}</span>

          <span>
            {dateLabel(post.event_date)}
            {post.start_time ? ` · ${timeLabel(post.start_time)}` : ""}
          </span>

          <span>{post.venue}</span>
        </div>

        <h2>{post.title}</h2>

        <p className={styles.copyTagline}>{post.tagline}</p>

        <p className={styles.copyDescription}>{post.description}</p>

        {post.cta_url && (
          <a
            href={post.cta_url}
            className={styles.primaryButton}
            target="_blank"
            rel="noreferrer"
          >
            {post.cta_label || "WHATSAPP TO RESERVE"}
          </a>
        )}
      </div>
    </article>
  );
}