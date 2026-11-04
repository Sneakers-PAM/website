/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type { ReactNode } from "react";
import { Links, Meta, Outlet, Scripts } from "react-router";

import { ConsentBar } from "./components/consent-bar";
import { ScrollToTop } from "./components/scroll-to-top";
import { themeInitScript } from "./theme";

import "@sneakers-pam/frame/site-frame.css";
import "./app.css";

const frameFonts = [
  "bricolage-grotesque-latin.woff2",
  "atkinson-hyperlegible-400-latin.woff2",
  "jetbrains-mono-latin.woff2",
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    // The head script sets data-theme before React hydrates (the system
    // setting, or the visitor's own choice once they have accepted the cookie
    // choice), so <html> differs from the prerendered markup on purpose.
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href={`${import.meta.env.BASE_URL}favicon.svg`} />
        <link rel="apple-touch-icon" href={`${import.meta.env.BASE_URL}apple-touch-icon.png`} />
        {/* The fonts the header and footer draw with, preloaded the same way on the
            docs site, so the frame never paints in a fallback face first. */}
        {frameFonts.map((font) => (
          <link
            key={font}
            rel="preload"
            href={`${import.meta.env.BASE_URL}fonts/${font}`}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ConsentBar />
        <ScrollToTop />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
