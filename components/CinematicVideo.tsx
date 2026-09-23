"use client";

import { useEffect, useRef } from "react";

type CinematicVideoProps = {
  src: string;
  start?: number;
  end?: number;
  className?: string;
  poster?: string;
  ariaLabel?: string;
};

export default function CinematicVideo({
  src,
  start = 0,
  end,
  className,
  poster,
  ariaLabel,
}: CinematicVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const safeStart = Math.max(0, start);

    const seekToSegmentStart = () => {
      if (!Number.isFinite(video.duration)) {
        return;
      }

      const safeEnd =
        end !== undefined
          ? Math.min(end, video.duration - 0.1)
          : video.duration;

      const actualStart = Math.min(
        safeStart,
        Math.max(0, safeEnd - 0.1),
      );

      video.currentTime = actualStart;

      void video.play().catch(() => {
        // Autoplay can be blocked by the browser.
        // The visual remains intact if playback cannot start.
      });
    };

    const handleTimeUpdate = () => {
      if (!Number.isFinite(video.duration)) {
        return;
      }

      const safeEnd =
        end !== undefined
          ? Math.min(end, video.duration - 0.1)
          : video.duration;

      if (video.currentTime >= safeEnd) {
        video.currentTime = safeStart;

        void video.play().catch(() => {
          // Ignore autoplay restrictions.
        });
      }
    };

    const handleLoadedMetadata = () => {
      seekToSegmentStart();
    };

    video.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata,
    );

    video.addEventListener(
      "timeupdate",
      handleTimeUpdate,
    );

    if (video.readyState >= 1) {
      seekToSegmentStart();
    }

    return () => {
      video.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata,
      );

      video.removeEventListener(
        "timeupdate",
        handleTimeUpdate,
      );
    };
  }, [src, start, end]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      autoPlay
      muted
      playsInline
      preload="metadata"
      poster={poster}
      aria-label={ariaLabel}
      disablePictureInPicture
      controls={false}
    />
  );
}