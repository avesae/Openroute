"use client";

import Script from "next/script";
import { useConsent } from "@/lib/consent";

/**
 * Яндекс Метрика (серверы в России). Загружается только после согласия на аналитические cookie.
 * Номер счётчика берётся из NEXT_PUBLIC_YM_ID (см. .env.example). Без номера ничего не грузится.
 * Вебвизор выключен: запись сессий посетителей — лишний сбор данных для сайта-визитки.
 */
export function Analytics({ ymId }: { ymId?: string }) {
  const consent = useConsent();
  if (!ymId || !/^\d+$/.test(ymId) || consent === "pending" || !consent?.analytics) return null;

  return (
    <Script id="yandex-metrika" strategy="afterInteractive">
      {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();
for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
ym(${ymId},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:false});`}
    </Script>
  );
}
