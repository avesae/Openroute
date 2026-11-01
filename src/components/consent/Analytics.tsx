"use client";

import Script from "next/script";
import { useConsent } from "@/lib/consent";

/**
 * Google Analytics 4. Загружается только после согласия «Принять все».
 * ID берётся из NEXT_PUBLIC_GA_ID (см. .env.example). Без ID ничего не грузится.
 */
export function Analytics({ gaId }: { gaId?: string }) {
  const consent = useConsent();
  if (!gaId || consent !== "all") return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
