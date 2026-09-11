import type { ReactNode } from "react";

type BrandedMediaProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallback: string;
  children?: ReactNode;
  priority?: boolean;
};

export default function BrandedMedia({ src, alt, className = "", fallback, children, priority = false }: BrandedMediaProps) {
  const hasMedia = Boolean(src);

  return (
    <div className={`brandedMedia ${className}${hasMedia ? " hasMedia" : ""}`} data-media-state={hasMedia ? "ready" : "missing"}>
      {hasMedia ? (
        <img
          src={src as string}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
      ) : (
        <div className="mediaFallback" role="img" aria-label={fallback}>
          <span className="mediaMark">1759</span>
          <strong>{fallback}</strong>
          <small>Media slot</small>
        </div>
      )}
      {children}
    </div>
  );
}
