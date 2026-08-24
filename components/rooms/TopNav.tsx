"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, Search, Sparkles } from "lucide-react";

const LINKS = [
  { href: "/", icon: Home, label: "Início" },
  { href: "/demo", icon: Sparkles, label: "Prévia" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-1 flex flex-col gap-0.5">
      {LINKS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex h-10 items-center gap-3 rounded-[10px] px-2.5 text-[14.5px] transition-colors ${
              active ? "bg-glass-2 text-text-1" : "text-text-2 hover:bg-glass-1 hover:text-text-1"
            }`}
          >
            <item.icon size={17} strokeWidth={1.5} />
            {item.label}
          </Link>
        );
      })}

      <button
        type="button"
        className="flex h-10 items-center gap-3 rounded-[10px] px-2.5 text-[14.5px] text-text-2 transition-colors hover:bg-glass-1 hover:text-text-1"
      >
        <Search size={17} strokeWidth={1.5} />
        Buscar
      </button>
      <button
        type="button"
        className="flex h-10 items-center gap-3 rounded-[10px] px-2.5 text-[14.5px] text-text-2 transition-colors hover:bg-glass-1 hover:text-text-1"
      >
        <Info size={17} strokeWidth={1.5} />
        Sobre a LOOP
      </button>
    </nav>
  );
}
