'use client';

import { useMemo, useState } from 'react';

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string; // default: /icons/placeholder.jpg
};

export default function BannerImage({
  src,
  alt,
  className,
  fallbackSrc = '/icons/placeholder.jpg',
}: Props) {
  // bersihin nilai aneh dari backend
  const cleaned = useMemo(() => {
    const s = typeof src === 'string' ? src.trim() : '';
    if (!s || s === 'null' || s === 'undefined') return '';
    return s;
  }, [src]);

  const [current, setCurrent] = useState<string>(cleaned || fallbackSrc);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      className={className}
      onError={() => {
        if (current !== fallbackSrc) setCurrent(fallbackSrc);
      }}
    />
  );
}
