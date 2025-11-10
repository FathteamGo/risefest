'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
    __GA_ID?: string;
    __FB_PIXEL_ID?: string;
  }
}

type AnalyticsProviderProps = {
  gaId?: string | null;
  fbPixelId?: string | null;
};

export function AnalyticsProvider({ gaId, fbPixelId }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const resolvedGaId =
    (gaId || '').trim() ||
    (typeof window !== 'undefined' && window.__GA_ID) ||
    '';

  const resolvedFbPixelId =
    (fbPixelId || '').trim() ||
    (typeof window !== 'undefined' && window.__FB_PIXEL_ID) ||
    '';

  // Init GA
  useEffect(() => {
    if (!resolvedGaId) return;

    window.__GA_ID = resolvedGaId;

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      };

    window.gtag('js', new Date());
    window.gtag('config', resolvedGaId, {
      page_path: window.location.pathname,
    });
  }, [resolvedGaId]);

  // Track pageview (GA + FB)
  useEffect(() => {
    const url =
      pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    if (resolvedGaId && typeof window.gtag === 'function') {
      window.gtag('config', resolvedGaId, { page_path: url });
    }

    if (resolvedFbPixelId && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [resolvedGaId, resolvedFbPixelId, pathname, searchParams]);

  return (
    <>
      {resolvedGaId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${resolvedGaId}`}
          />
          <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.__GA_ID = '${resolvedGaId}';
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${resolvedGaId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      {resolvedFbPixelId && (
        <>
          <Script
            id="fb-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.__FB_PIXEL_ID = '${resolvedFbPixelId}';
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${resolvedFbPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${resolvedFbPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}
    </>
  );
}
