import Image from "next/image";
import Link from "next/link";
import { Navbar } from "./Navbar";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
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
        <Navbar />
      </div>
    </header>
  );
}
