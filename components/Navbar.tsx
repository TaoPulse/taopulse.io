"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/subnets", label: "Subnets" },
  { href: "/staking", label: "Staking" },
  { href: "/news", label: "News" },
  { href: "/buy-tao", label: "Buy TAO" },
];

const learnLinks = [
  { href: "/what-is-tao", label: "What is TAO?" },
  { href: "/emissions", label: "How Emissions Work" },
  { href: "/dtao", label: "Dynamic TAO (dTAO)" },
  { href: "/halving", label: "TAO Halving" },
  { href: "/glossary", label: "Glossary" },
];

const toolLinks = [
  { href: "/validator-calculator", label: "Validator Calculator" },
  { href: "/portfolio", label: "Portfolio Tracker" },
  { href: "/wallets", label: "Wallets Guide" },
  { href: "/subnets/directory", label: "Subnet Directory" },
  { href: "/join", label: "⚡ Alpha Pulse Newsletter" },
  { href: "/should-i-stake-or-mine", label: "Stake or Mine?" },
];

const allNavLinks = [...primaryLinks, ...learnLinks, ...toolLinks];

type DropdownProps = {
  label: string;
  links: { href: string; label: string }[];
  pathname: string;
  onNavigate: () => void;
};

function NavDropdown({ label, links, pathname, onNavigate }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isActive = links.some((l) =>
    l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? "text-white bg-white/10"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        {label}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-1 w-52 bg-[#0f1623] border border-white/10 rounded-xl shadow-xl py-1.5 z-50"
        >
          {links.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => { setOpen(false); onNavigate(); }}
                className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "text-white bg-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileLearnOpen, setMobileLearnOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-[#080d14]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-center shrink-0 leading-none gap-0.5">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-white">TAO</span><span className="text-purple-500">Pulse</span>
            </span>
            <svg viewBox="0 0 80 16" width="92" height="13" xmlns="http://www.w3.org/2000/svg">
              <polyline
                points="0,8 35.2,8 37.6,6 38.4,11.2 40,0 41.6,16 43.2,8 45.6,8 48,11.2 50.4,8 80,8"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {primaryLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-white bg-white/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <NavDropdown
              label="Learn"
              links={learnLinks}
              pathname={pathname}
              onNavigate={() => {}}
            />
            <NavDropdown
              label="Tools"
              links={toolLinks}
              pathname={pathname}
              onNavigate={() => {}}
            />
          </div>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/join"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
            >
              ⚡ Alpha Pulse
            </Link>
            <button
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0f1a]">
          <div className="px-4 py-3 space-y-1">
            {/* Primary links */}
            {primaryLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-white bg-white/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Learn section */}
            <div className="pt-1">
              <button
                onClick={() => setMobileLearnOpen((p) => !p)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Learn
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${mobileLearnOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileLearnOpen && (
                <div className="pl-3 mt-1 space-y-1">
                  {learnLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tools section */}
            <div>
              <button
                onClick={() => setMobileToolsOpen((p) => !p)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Tools
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${mobileToolsOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileToolsOpen && (
                <div className="pl-3 mt-1 space-y-1">
                  {toolLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/join"
              onClick={() => setMobileOpen(false)}
              className="block mt-2 px-3 py-2.5 rounded-md bg-purple-600 text-white text-sm font-semibold text-center transition-colors hover:bg-purple-500"
            >
              ⚡ Alpha Pulse
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
