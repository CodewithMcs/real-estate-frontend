"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaUser } from "react-icons/fa6";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
  { label: "Contact", href: "/contact" },
];

const informationLinks = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
];

export function Navbar({ isOverlay = false }: { isOverlay?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isInformationOpen, setIsInformationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  function closeMenu() {
    setIsOpen(false);
    setIsInformationOpen(false);
    setIsProfileOpen(false);
  }

  function isActiveLink(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  const isInformationActive = informationLinks.some((link) =>
    isActiveLink(link.href),
  );
  const userName =
    user?.display_name ?? user?.first_name ?? user?.email ?? "My Account";
  const isAdmin = user?.role_id === 1;
  const visibleNavLinks = isAdmin
    ? navLinks.filter((link) => link.href !== "/contact")
    : navLinks;

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (
        navRef.current &&
        event.target instanceof Node &&
        !navRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={navRef}>
      <nav className={`hidden items-center gap-5 text-sm font-medium lg:gap-7 md:flex ${isOverlay ? "text-white" : "text-gray-700"}`}>
        {visibleNavLinks.map((link) => {
          const isActive = isActiveLink(link.href);

          return (
            <Link
              className={`relative py-2 transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-red-500 after:transition-all after:duration-300 hover:-translate-y-0.5 hover:text-red-500 hover:after:w-full ${
                isActive
                  ? "text-red-500 after:w-full"
                  : "after:w-0"
              }`}
              href={link.href}
              key={link.href}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          );
        })}
        <div className="relative">
          <button
            aria-expanded={isInformationOpen}
            aria-haspopup="menu"
            className={`relative flex items-center gap-1 py-2 transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-red-500 after:transition-all after:duration-300 hover:text-red-500 hover:after:w-full ${
              isInformationActive ? "text-red-500 after:w-full" : "after:w-0"
            }`}
            onClick={() => {
              setIsInformationOpen((current) => !current);
              setIsProfileOpen(false);
            }}
            type="button"
          >
            Information
            <FaChevronDown
              className={`transition-transform ${isInformationOpen ? "rotate-180" : ""}`}
              size={11}
            />
          </button>
          {isInformationOpen ? (
            <div
              className="absolute left-1/2 top-11 z-50 w-48 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-2 shadow-xl"
              role="menu"
            >
              {informationLinks.map((link) => {
                const isActive = isActiveLink(link.href);

                return (
                  <Link
                    className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-red-50 hover:text-red-500 ${
                      isActive ? "bg-red-50 text-red-500" : "text-gray-700"
                    }`}
                    href={link.href}
                    key={link.href}
                    role="menuitem"
                    onClick={() => setIsInformationOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
        {!isLoading && isAuthenticated ? (
          <div className="relative">
            <button
              aria-expanded={isProfileOpen}
              aria-haspopup="menu"
              className={`flex h-11 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors hover:border-red-300 hover:text-red-500 ${isOverlay ? "border-white/30 bg-black/20 text-white" : "border-gray-200 bg-white text-gray-800"}`}
              onClick={() => {
                setIsProfileOpen((current) => !current);
                setIsInformationOpen(false);
              }}
              type="button"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500">
                <FaUser size={13} />
              </span>
              <span className="max-w-28 truncate">{userName}</span>
              <FaChevronDown
                className={`transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                size={12}
              />
            </button>

            {isProfileOpen ? (
              <div
                className="absolute right-0 top-[52px] z-50 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-xl"
                role="menu"
              >
                <div className="border-b border-gray-100 px-3 py-2">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {userName}
                  </p>
                  {user?.email ? (
                    <p className="truncate text-xs text-gray-500">{user.email}</p>
                  ) : null}
                </div>
                <Link
                  className="mt-2 block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500"
                  href="/post-property"
                  onClick={closeMenu}
                  role="menuitem"
                >
                  Sell Property
                </Link>
                {isAdmin ? (
                  <Link
                    className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500"
                    href="/admin/dashboard"
                    onClick={closeMenu}
                    role="menuitem"
                  >
                    Admin Dashboard
                  </Link>
                ) : null}
                <Link
                  className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500"
                  href="/recent-activity?activeTab=VIEWED"
                  onClick={closeMenu}
                  role="menuitem"
                >
                  My Activity
                </Link>
                <Link
                  className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500"
                  href="/profile"
                  onClick={closeMenu}
                  role="menuitem"
                >
                  Profile
                </Link>
                <button
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-500"
                  onClick={() => {
                    setIsProfileOpen(false);
                    void logout();
                  }}
                  role="menuitem"
                  type="button"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              className={`font-semibold transition-colors hover:text-red-500 ${isOverlay ? "text-white" : "text-gray-700"}`}
              href="/auth/login"
              onClick={closeMenu}
            >
              Login
            </Link>
            <Link
              className="rounded-md bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600"
              href="/auth/register"
              onClick={closeMenu}
            >
              Create account
            </Link>
          </div>
        )}
      </nav>

      <button
        aria-expanded={isOpen}
        aria-label="Toggle navigation menu"
        className={`flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-md border md:hidden ${isOverlay ? "border-white/40 text-white" : "border-gray-200 text-black"}`}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className={`h-0.5 w-5 ${isOverlay ? "bg-white" : "bg-black"}`} />
        <span className={`h-0.5 w-5 ${isOverlay ? "bg-white" : "bg-black"}`} />
        <span className={`h-0.5 w-5 ${isOverlay ? "bg-white" : "bg-black"}`} />
      </button>

      {isOpen ? (
        <nav className="absolute right-0 top-12 z-50 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:hidden">
          <div className="grid gap-1.5">
            {visibleNavLinks.map((link) => {
              const isActive = isActiveLink(link.href);

              return (
                <Link
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:translate-x-1 hover:bg-gray-100 hover:text-red-500 ${
                    isActive
                      ? "bg-red-50 text-red-500"
                      : "text-gray-700"
                  }`}
                  href={link.href}
                  key={link.href}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-3 grid gap-1.5 border-t border-gray-100 pt-3">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Information
              </p>
              {informationLinks.map((link) => {
                const isActive = isActiveLink(link.href);

                return (
                  <Link
                    className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-1 hover:bg-gray-100 hover:text-red-500 ${
                      isActive ? "bg-red-50 text-red-500" : "text-gray-700"
                    }`}
                    href={link.href}
                    key={link.href}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            {!isLoading && isAuthenticated ? (
              <div className="mt-3 grid gap-1.5 border-t border-gray-100 pt-3">
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Account
                </p>
                <Link
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-red-500"
                  href="/post-property"
                  onClick={closeMenu}
                >
                  Sell Property
                </Link>
                {isAdmin ? (
                  <Link
                    className="block rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-red-500"
                    href="/admin/dashboard"
                    onClick={closeMenu}
                  >
                    Admin Dashboard
                  </Link>
                ) : null}
                <Link
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-red-500"
                  href="/recent-activity?activeTab=VIEWED"
                  onClick={closeMenu}
                >
                  My Activity
                </Link>
                <Link
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-red-500"
                  href="/profile"
                  onClick={closeMenu}
                >
                  Profile
                </Link>
                <button
                  className="block rounded-md px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-red-500"
                  onClick={() => {
                    closeMenu();
                    void logout();
                  }}
                  type="button"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-2 grid gap-2 border-t border-gray-100 pt-3">
                <Link
                  className="rounded-md px-3 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-red-500"
                  href="/auth/login"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  className="rounded-md bg-red-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-red-600"
                  href="/auth/register"
                  onClick={closeMenu}
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
