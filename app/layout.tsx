import type { Metadata } from "next";
import "./globals.css";
import Nav, { type NavItem } from "@/components/Nav";
import Footer from "@/components/Footer";
import { navItemsPresent } from "@/lib/content";

export const metadata: Metadata = {
  title: {
    default: "Ardeo — A Codex of the World",
    template: "%s · Ardeo Codex",
  },
  description:
    "An encyclopedia of Ardeo: its realms, peoples, factions, gods, and the history that binds them.",
};

function navData(): NavItem[] {
  return navItemsPresent().map((i) => ({
    key: i.key,
    label: i.label,
    href: i.href,
  }));
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <Nav items={navData()} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
