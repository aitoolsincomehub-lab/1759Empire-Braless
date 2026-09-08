import type { ReactNode } from "react";

type BrandedMediaProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallback: string;
  children?: ReactNode;
};

export default function BrandedMedia({ src, alt, className = "", fallback, children }: BrandedMediaProps) {
  return <div className={`brandedMedia ${className}${src ? " hasMedia" : ""}`}>
    {src ? <img src={src} alt={alt} loading="lazy" /> : <div className="mediaFallback"><span className="mediaMark">1759</span><strong>{fallback}</strong></div>}
    {children}
  </div>;
}
