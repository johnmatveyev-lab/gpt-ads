import type { Metadata } from "next";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import AvaVoiceOrbProvider from "@/components/AvaVoiceOrbProvider";
import OpenAIAdsPixel from "@/components/OpenAIAdsPixel";
import "./globals.css";

export const metadata: Metadata = {
  title: "GPT Ads Launch | ChatGPT Ads readiness for local businesses",
  description:
    "ChatGPT Ads launch support, readiness audits, and campaign planning for local businesses.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <OpenAIAdsPixel />
        <AnalyticsTracker />
        <AvaVoiceOrbProvider>{children}</AvaVoiceOrbProvider>
      </body>
    </html>
  );
}
