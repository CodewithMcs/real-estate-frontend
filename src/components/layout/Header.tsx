"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "./Navbar";

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomeOverlay = pathname === "/" && !isScrolled;

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`top-0 z-40 w-full transition-all duration-300 ${
        isHomeOverlay
          ? "fixed border-b border-white/15 bg-gradient-to-b from-black/55 to-transparent text-white"
          : "sticky border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link className="flex items-center gap-3" href="/">
          <Image
            alt="Red Sand Group logo"
            className="h-12 w-auto"
            height={64}
            priority
            src="/images/logo.png"
            width={160}
          />
        </Link>
        <Navbar isOverlay={isHomeOverlay} />
      </div>
    </header>
  );
}
