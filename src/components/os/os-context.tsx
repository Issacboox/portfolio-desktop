"use client";

import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";
import { wallpapers } from "./wallpapers";

export type AppId = "about" | "projects" | "terminal" | "blog" | "mail" | "settings";

export type WinState = {
  id: AppId;
  z: number;
  minimized: boolean;
  maximized: boolean;
  props?: Record<string, string>;
};

type State = {
  windows: WinState[];
  topZ: number;
  wallpaperId: string;
  dark: boolean;
  spotlightOpen: boolean;
};

type Action =
  | { type: "open"; id: AppId; props?: Record<string, string> }
  | { type: "close"; id: AppId }
  | { type: "focus"; id: AppId }
  | { type: "minimize"; id: AppId }
  | { type: "toggleMax"; id: AppId }
  | { type: "wallpaper"; id: string }
  | { type: "dark"; value: boolean }
  | { type: "spotlight"; open: boolean };

function reducer(state: State, a: Action): State {
  switch (a.type) {
    case "open": {
      const z = state.topZ + 1;
      const existing = state.windows.find((w) => w.id === a.id);
      if (existing) {
        return {
          ...state,
          topZ: z,
          windows: state.windows.map((w) =>
            w.id === a.id ? { ...w, z, minimized: false, props: a.props ?? w.props } : w,
          ),
        };
      }
      return { ...state, topZ: z, windows: [...state.windows, { id: a.id, z, minimized: false, maximized: false, props: a.props }] };
    }
    case "close":
      return { ...state, windows: state.windows.filter((w) => w.id !== a.id) };
    case "focus": {
      const z = state.topZ + 1;
      return { ...state, topZ: z, windows: state.windows.map((w) => (w.id === a.id ? { ...w, z } : w)) };
    }
    case "minimize":
      return { ...state, windows: state.windows.map((w) => (w.id === a.id ? { ...w, minimized: true } : w)) };
    case "toggleMax":
      return { ...state, windows: state.windows.map((w) => (w.id === a.id ? { ...w, maximized: !w.maximized } : w)) };
    case "wallpaper": {
      const wp = wallpapers.find((w) => w.id === a.id);
      return { ...state, wallpaperId: a.id, dark: wp ? wp.dark : state.dark };
    }
    case "dark":
      return { ...state, dark: a.value };
    case "spotlight":
      return { ...state, spotlightOpen: a.open };
  }
}

type OS = State & {
  open: (id: AppId, props?: Record<string, string>) => void;
  close: (id: AppId) => void;
  focus: (id: AppId) => void;
  minimize: (id: AppId) => void;
  toggleMax: (id: AppId) => void;
  setWallpaper: (id: string) => void;
  setDark: (value: boolean) => void;
  setSpotlight: (open: boolean) => void;
  activeApp: AppId | null;
};

const Ctx = createContext<OS | null>(null);

export function OSProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    windows: [],
    topZ: 10,
    wallpaperId: "sunrise",
    dark: false,
    spotlightOpen: false,
  });

  const open = useCallback((id: AppId, props?: Record<string, string>) => dispatch({ type: "open", id, props }), []);
  const close = useCallback((id: AppId) => dispatch({ type: "close", id }), []);
  const focus = useCallback((id: AppId) => dispatch({ type: "focus", id }), []);
  const minimize = useCallback((id: AppId) => dispatch({ type: "minimize", id }), []);
  const toggleMax = useCallback((id: AppId) => dispatch({ type: "toggleMax", id }), []);
  const setWallpaper = useCallback((id: string) => dispatch({ type: "wallpaper", id }), []);
  const setDark = useCallback((value: boolean) => dispatch({ type: "dark", value }), []);
  const setSpotlight = useCallback((o: boolean) => dispatch({ type: "spotlight", open: o }), []);

  const activeApp = useMemo(() => {
    const visible = state.windows.filter((w) => !w.minimized);
    if (!visible.length) return null;
    return visible.reduce((a, b) => (a.z > b.z ? a : b)).id;
  }, [state.windows]);

  const value = useMemo(
    () => ({ ...state, open, close, focus, minimize, toggleMax, setWallpaper, setDark, setSpotlight, activeApp }),
    [state, open, close, focus, minimize, toggleMax, setWallpaper, setDark, setSpotlight, activeApp],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOS() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOS must be used inside <OSProvider>");
  return v;
}
