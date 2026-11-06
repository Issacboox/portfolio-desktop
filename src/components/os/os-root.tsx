"use client";

import dynamic from "next/dynamic";

// The OS is fully interactive and time-based, so it renders on the client only.
const Desktop = dynamic(() => import("./desktop"), { ssr: false });

export function OSRoot() {
  return <Desktop />;
}
