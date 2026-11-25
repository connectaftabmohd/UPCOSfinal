import React, { useState, useEffect, useRef } from 'react';

interface NewsThumbnailProps {
  src: string;
  alt: string;
  containerClassName?: string;
  portraitContainerClassName?: string;
  landscapeImgClassName?: string;
  portraitImgClassName?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
  children?: React.ReactNode;
}

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80';

export const NewsThumbnail: React.FC<NewsThumbnailProps> = ({
  src,
  alt,
  containerClassName = 'relative overflow-hidden aspect-16/10 bg-slate-100',
  portraitContainerClassName = 'relative overflow-hidden aspect-16/10 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-1.5',
  landscapeImgClassName = 'w-full h-full object-cover group-hover:scale-104 transition-transform duration-500',
  portraitImgClassName = 'w-full h-full object-contain rounded-md group-hover:scale-103 transition-transform duration-500',
  fallbackSrc = DEFAULT_FALLBACK,
  loading = 'lazy',
  onClick,
  children,
}) => {
  const [isPortrait, setIsPortrait] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setIsPortrait(false);
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setIsPortrait(img.naturalHeight > img.naturalWidth);
    }
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth > 0) {
      setIsPortrait(img.naturalHeight > img.naturalWidth);
    }
  };

  return (
    <div
      className={isPortrait ? portraitContainerClassName : containerClassName}
      onClick={onClick}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        referrerPolicy="no-referrer"
        onLoad={handleLoad}
        onError={(e) => {
          const target = e.currentTarget;
          if (target.dataset.fallbackApplied) return;
          target.dataset.fallbackApplied = 'true';
          target.src = fallbackSrc;
          setIsPortrait(false);
        }}
        className={isPortrait ? portraitImgClassName : landscapeImgClassName}
      />
      {children}
    </div>
  );
};
