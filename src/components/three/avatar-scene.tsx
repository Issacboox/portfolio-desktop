"use client";

import { ContactShadows, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import type { Group, Object3D } from "three";
import { MathUtils } from "three";

const MODEL = "/models/avatar.glb";

/** Window-wide pointer in -1..1, so the head follows the cursor anywhere on the page. */
function usePointer() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return pointer;
}

function Avatar({ reduceMotion }: { reduceMotion: boolean }) {
  const { scene } = useGLTF(MODEL);
  const root = useRef<Group>(null);
  const pointer = usePointer();
  const invalidate = useThree((s) => s.invalidate);

  // The canvas renders on demand: wake it when the cursor moves, and for the next blink.
  useEffect(() => {
    const wake = () => invalidate();
    window.addEventListener("pointermove", wake, { passive: true });
    let timer = 0;
    const blink = () => {
      invalidate();
      timer = window.setTimeout(blink, 2500 + Math.random() * 3000);
    };
    if (!reduceMotion) timer = window.setTimeout(blink, 2000);
    return () => {
      window.removeEventListener("pointermove", wake);
      clearTimeout(timer);
    };
  }, [invalidate, reduceMotion]);

  // three.js objects are mutated every frame, so keep them in refs (not memoised values).
  const headRef = useRef<Object3D | null>(null);
  const eyesRef = useRef<Object3D[]>([]);
  useEffect(() => {
    headRef.current = scene.getObjectByName("Head") ?? null;
    const eyes: Object3D[] = [];
    scene.traverse((o) => {
      if (o.name.startsWith("Eye")) eyes.push(o);
    });
    eyesRef.current = eyes;
  }, [scene]);

  const blinkStart = useRef(-1);
  const lastBlinkWake = useRef(0);

  useFrame((state, rawDelta) => {
    // After idle, the first delta can be seconds long; clamp it so easing stays smooth.
    const delta = Math.min(rawDelta, 1 / 30);
    const t = state.clock.elapsedTime;
    const { x, y } = pointer.current;
    let moving = false;
    const ease = (cur: number, target: number, k: number) => {
      const next = MathUtils.damp(cur, target, k, delta);
      if (Math.abs(target - next) > 0.0015) moving = true;
      return next;
    };

    // Head turns toward the cursor (clamped, eased).
    const head = headRef.current;
    if (head) {
      head.rotation.y = ease(head.rotation.y, x * 0.6, 6);
      head.rotation.x = ease(head.rotation.x, -y * 0.28, 6);
      head.rotation.z = ease(head.rotation.z, -x * 0.08, 4);
    }
    // Body follows a little, for a natural lean.
    if (root.current) {
      root.current.rotation.y = ease(root.current.rotation.y, x * 0.18, 3);
    }
    // Blink: a timer wakes the canvas, then we render ~10 frames for the blink itself.
    if (!reduceMotion) {
      if (blinkStart.current < 0 && t - lastBlinkWake.current > 2) {
        blinkStart.current = t;
        lastBlinkWake.current = t;
      }
      if (blinkStart.current >= 0) {
        const phase = t - blinkStart.current;
        const s = phase < 0.16 ? Math.abs(Math.cos((phase / 0.16) * Math.PI)) : 1;
        eyesRef.current.forEach((e) => e.scale.setY(Math.max(0.1, s)));
        if (phase >= 0.16) blinkStart.current = -1;
        else moving = true;
      }
    }
    // Keep rendering only while something is still settling.
    if (moving) state.invalidate();
  });

  return (
    <group ref={root}>
      <primitive object={scene} />
    </group>
  );
}

/** `distance` lets small containers (the desktop widget) frame a closer bust shot. */
export default function AvatarScene({ distance = 4.2 }: { distance?: number }) {
  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  return (
    <Canvas
      camera={{ position: [0, 1.15, distance], fov: 30 }}
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ camera }) => camera.lookAt(0, 0.98, 0)}
      aria-label="3D avatar of Nurarat that follows your cursor"
    >
      <ambientLight intensity={1.1} />
      <hemisphereLight args={["#fff4ea", "#3a0c08", 0.9]} />
      <directionalLight position={[2.5, 3.5, 3]} intensity={2.2} />
      <directionalLight position={[-3, 1.5, 1]} intensity={0.8} color="#ffd9cf" />
      <Suspense fallback={null}>
        <Avatar reduceMotion={reduceMotion} />
        {/* frames={1}: bake the soft shadow once instead of re-rendering it every frame */}
        <ContactShadows position={[0, -0.01, 0]} opacity={0.45} scale={3} blur={2.4} far={1.2} resolution={256} frames={1} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL);
