"use client";

import { useEffect, useRef, useState } from "react";

type CinematicVideoProps = {
  src: string;
  start?: number;
  end?: number;
  className?: string;
  poster?: string;
  ariaLabel?: string;
  /** Ambient clips play only while near the viewport; manual clips wait for the visitor. */
  playback?: "ambient" | "manual";
};

export default function CinematicVideo({
  src,
  start = 0,
  end,
  className,
  poster,
  ariaLabel,
  playback = "ambient",
}: CinematicVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  // Do not attach the video URL until the clip is close to being seen.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: "120px 0px", threshold: 0.01 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isNearViewport) {
      video.pause();
      if (video.hasAttribute("src")) {
        video.removeAttribute("src");
        video.load();
      }
      return;
    }

    const safeStart = Math.max(0, start);

    const safeEnd = () =>
      Number.isFinite(video.duration)
        ? end !== undefined
          ? Math.min(end, Math.max(0, video.duration - 0.1))
          : video.duration
        : Number.POSITIVE_INFINITY;

    const seekToSegmentStart = () => {
      if (!Number.isFinite(video.duration)) return;

      const segmentEnd = safeEnd();
      video.currentTime = Math.min(
        safeStart,
        Math.max(0, segmentEnd - 0.1),
      );

      if (playback === "ambient" && isNearViewport) {
        void video.play().catch(() => {
          // Autoplay may be blocked by browser settings.
        });
      }
    };

    const handleTimeUpdate = () => {
      if (!Number.isFinite(video.duration)) return;

      if (video.currentTime >= safeEnd()) {
        video.currentTime = Math.min(
          safeStart,
          Math.max(0, video.duration - 0.1),
        );

        if (playback === "ambient") {
          void video.play().catch(() => undefined);
        }
      }
    };

    video.addEventListener("loadedmetadata", seekToSegmentStart);
    video.addEventListener("timeupdate", handleTimeUpdate);

    if (video.readyState >= 1) {
      seekToSegmentStart();
    }

    return () => {
      video.removeEventListener("loadedmetadata", seekToSegmentStart);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [src, start, end, isNearViewport, playback]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={isNearViewport ? src : undefined}
      autoPlay={playback === "ambient" && isNearViewport}
      muted={playback === "ambient"}
      playsInline
      preload={
        isNearViewport && playback === "ambient" ? "metadata" : "none"
      }
      poster={poster}
      aria-label={ariaLabel}
      disablePictureInPicture
      controls={playback === "manual"}
    />
  );
}
