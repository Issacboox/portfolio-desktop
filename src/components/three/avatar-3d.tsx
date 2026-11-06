"use client";

import dynamic from "next/dynamic";

// three.js only runs in the browser, so the scene is loaded client-side only.
const AvatarScene = dynamic(() => import("./avatar-scene"), { ssr: false });

export function Avatar3D() {
  return <AvatarScene />;
}
