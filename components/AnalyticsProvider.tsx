'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { ENV } from '@/lib/env';

declare global {
  interface Window {
    gtag: any;
    fbq: any;
  }
}

export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize Google Analytics
  useEffect(() => {
    const gaId = ENV.PUBLIC_GOOGLE_ANALYTICS_ID;
    if (gaId) {
      window.gtag = window.gtag || function() {
        (window.gtag.q = window.gtag.q || []).push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', gaId);
    }
  }, []);

  // Track page views
  useEffect(() => {
    const gaId = ENV.PUBLIC_GOOGLE_ANALYTICS_ID;
    const fbPixelId = ENV.PUBLIC_FACEBOOK_PIXEL_ID;
    
    if (gaId) {
      window.gtag('config', gaId, {
        page_path: pathname,
      });
    }
    
    if (fbPixelId && typeof window.fbq !== 'undefined') {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams]);

  // Initialize Facebook Pixel
  const renderFacebookPixel = () => {
    const fbPixelId = ENV.PUBLIC_FACEBOOK_PIXEL_ID;
    if (!fbPixelId) return null;

    return (
      <>
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${fbPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
          />
        </noscript>
      </>
    );
  };

  // Initialize Google Analytics
  const renderGoogleAnalytics = () => {
    const gaId = ENV.PUBLIC_GOOGLE_ANALYTICS_ID;
    if (!gaId) return null;

    return (
      <>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </>
    );
  };

  return (
    <>
      {renderFacebookPixel()}
      {renderGoogleAnalytics()}
    </>
  );
}