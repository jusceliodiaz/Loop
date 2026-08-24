"use client";

import { createContext, useContext, useState, useSyncExternalStore } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

const DrawerContext = createContext<{ open: boolean; toggle: () => void } | null>(null);

const MOBILE_QUERY = "(max-width: 899px)";

function subscribeToMobileQuery(callback: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getIsMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getIsMobileServerSnapshot() {
  return false;
}

export function SidebarDrawerProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useSyncExternalStore(subscribeToMobileQuery, getIsMobileSnapshot, getIsMobileServerSnapshot);
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const open = manualOpen ?? !isMobile;

  return (
    <DrawerContext.Provider value={{ open, toggle: () => setManualOpen(!open) }}>{children}</DrawerContext.Provider>
  );
}

export function SidebarDrawerToggle() {
  const ctx = useContext(DrawerContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      title={ctx.open ? "Recolher painel" : "Expandir painel"}
      onClick={ctx.toggle}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-3 transition-colors hover:bg-glass-1 hover:text-text-2"
    >
      {ctx.open ? <PanelLeftClose size={17} strokeWidth={1.5} /> : <PanelLeftOpen size={17} strokeWidth={1.5} />}
    </button>
  );
}

/** Lives outside the collapsible aside so there's always a way back in once it's closed. */
export function SidebarDrawerFloatingToggle() {
  const ctx = useContext(DrawerContext);
  if (!ctx || ctx.open) return null;
  return (
    <button
      type="button"
      title="Expandir painel"
      onClick={ctx.toggle}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-3 transition-colors hover:bg-glass-1 hover:text-text-2"
    >
      <PanelLeftOpen size={17} strokeWidth={1.5} />
    </button>
  );
}

export function SidebarDrawer({ children }: { children: React.ReactNode }) {
  const ctx = useContext(DrawerContext);
  const open = ctx?.open ?? true;
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={ctx?.toggle}
          className="fixed inset-0 z-10 bg-black/40 [@media(min-width:900px)]:hidden"
        />
      )}
      <aside
        className={`z-20 flex shrink-0 flex-col overflow-hidden border-stroke-soft bg-bg-sidebar py-5 transition-[width,transform] duration-300 [@media(max-width:899px)]:fixed [@media(max-width:899px)]:inset-y-0 [@media(max-width:899px)]:left-0 [@media(max-width:899px)]:w-[280px] [@media(max-width:899px)]:rounded-l-[28px] [@media(min-width:900px)]:border-r ${
          open
            ? "w-[280px] px-5 [@media(max-width:899px)]:translate-x-0"
            : "w-0 px-0 [@media(max-width:899px)]:-translate-x-full"
        }`}
      >
        <div className="flex h-full w-[280px] flex-col overflow-y-auto">{children}</div>
      </aside>
    </>
  );
}
