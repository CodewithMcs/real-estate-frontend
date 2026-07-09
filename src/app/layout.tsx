import { AuthProvider } from "@/context/AuthContext";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: {
    default: "Red Sand Group | Best Property Developer in Tambaram, Chennai",
    template: "%s | Red Sand Group",
  },

  description:
    "Red Sand Group is a trusted property developer in Tambaram, Chennai, India. We offer legally verified residential plots, villas, and real estate investment opportunities with complete transparency.",

  keywords: [
    "Property Developer in Tambaram",
    "Property Developer in Chennai",
    "Real Estate Chennai",
    "Plots in Tambaram",
    "Plots in Chennai",
    "Residential Plots Chennai",
    "Property Investment Chennai",
    "Real Estate India",
    "Red Sand Group",
  ],

  openGraph: {
    title: "Red Sand Group | Best Property Developer in Tambaram, Chennai",
    description:
      "Trusted real estate developer in Chennai offering legally verified plots and investment opportunities.",
    url: "https://www.redsandgroup.com",
    siteName: "Red Sand Group",
    locale: "en_IN", // English - India
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            {children}
            <Footer />
            <ScrollToTop />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
