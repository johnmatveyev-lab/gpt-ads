"use client";

import { useEffect } from "react";

export default function AnalyticsTracker() {
  useEffect(() => {
    track("page_view", {
      path: window.location.pathname,
      search: window.location.search,
      referrer: document.referrer || undefined,
    });

    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest("a,button") : null;
      if (!target) return;

      const label = target.textContent?.trim().replace(/\s+/g, " ").slice(0, 120) || target.getAttribute("aria-label");
      if (!label) return;

      const href = target instanceof HTMLAnchorElement ? target.href : undefined;
      const isCta = /audit|ava|book|call|start|readiness|chat/i.test(label);
      if (isCta) track("cta_click", { label, href });
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}

function track(event: string, payload: Record<string, unknown>) {
  const body = JSON.stringify({ event, payload });
  const sent = navigator.sendBeacon?.("/api/analytics", new Blob([body], { type: "application/json" }));

  if (!sent) {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  }
}
