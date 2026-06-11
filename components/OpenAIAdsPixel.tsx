"use client";

import Script from "next/script";

export default function OpenAIAdsPixel() {
  const pixelId = process.env.NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID;
  const pixelSrc = process.env.NEXT_PUBLIC_OPENAI_ADS_PIXEL_SRC;

  if (!pixelId || !pixelSrc) return null;

  return (
    <>
      <Script id="openai-ads-pixel-config" strategy="afterInteractive">
        {`window.openAIAdsPixelId = ${JSON.stringify(pixelId)};`}
      </Script>
      <Script src={pixelSrc} strategy="afterInteractive" />
    </>
  );
}
