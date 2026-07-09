import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Buy", href: "/buy" },
  { label: "Sell", href: "/sell" },
  { label: "Properties", href: "/properties" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: FaFacebookF,
    hoverBgColor: "hover:bg-blue-600",
  },
  {
    label: "Instagram",
    href: "#",
    icon: FaInstagram,
    hoverBgColor: "hover:bg-pink-500",
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: FaLinkedinIn,
    hoverBgColor: "hover:bg-blue-700",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/919025044044",
    icon: FaWhatsapp,
    hoverBgColor: "hover:bg-green-500",
  },
  {
    label: "X",
    href: "#",
    icon: FaXTwitter,
    hoverBgColor: "hover:bg-zinc-800",
  },
];

export function Footer() {
  return (
    <footer className="bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.8fr_1.1fr]">
          <section>
            <Link className="text-2xl font-bold text-red-500" href="/">
              RED SAND GROUP
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-300">
              Established in 2010, we are a recognized real estate organization
              helping customers buy, sell, and discover properties with trust.
            </p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    aria-label={social.label}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition-colors ${social.hoverBgColor}`}
                    href={social.href}
                    key={social.label}
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold">Quick Links</h2>
            <nav className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-300 md:grid-cols-1">
              {footerLinks.map((link) => (
                <Link
                  className="w-fit transition-colors hover:text-red-400"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>

          <section>
            <h2 className="text-base font-semibold">Contact Us</h2>
            <div className="mt-4 space-y-2 text-sm leading-6 text-gray-300">
              <p className="font-medium text-white">INDIA DITS</p>
              <a
                className="block transition-colors hover:text-red-400"
                href="https://www.google.com/maps/search/?api=1&query=20%2C%20Elumalai%20St%2C%20West%20Tambaram%2C%20Tambaram%2C%20Chennai%2C%20Tamil%20Nadu%20600045"
                rel="noopener noreferrer"
                target="_blank"
              >
                20, Elumalai St, West Tambaram, Tambaram, Chennai, Tamil Nadu -
                600 045
              </a>
              <p>
                <span className="text-gray-500">Email:</span>{" "}
                <a
                  className="transition-colors hover:text-red-400"
                  href="mailto:redsandgroup.in@gmail.com"
                >
                  redsandgroup.in@gmail.com
                </a>
              </p>
              <p>
                <span className="text-gray-500">Phone:</span>{" "}
                <a
                  className="transition-colors hover:text-red-400"
                  href="tel:+919025044044"
                >
                  +91-9025044044
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-4 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>(c) 2026 Red Sand Group. All rights reserved.</p>
          <p>Real estate services in Chennai and beyond.</p>
        </div>
      </div>
    </footer>
  );
}
