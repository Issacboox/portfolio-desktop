"use client";

import { useEffect } from "react";

/** Registers the service worker in production only, so dev never serves stale cached files. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* not critical: the site works without it */
    });
  }, []);
  return null;
}
