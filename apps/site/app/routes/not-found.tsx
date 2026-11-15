/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type { MetaFunction } from "react-router";

import { Footer } from "~/components/footer";
import { Nav } from "~/components/nav";
import { Section } from "~/components/section";
import { siteHref } from "~/components/site-href";
import { footer, nav } from "~/content/sneakers-pam";

// The page for any path the site has no page for. It is prerendered to
// 404.html, which Cloudflare Pages serves for an unknown path with a 404
// status, so a crawler sees a real 404 and not a soft 200. It stays out of
// search.
export const meta: MetaFunction = () => [
  { title: "Page not found | Sneakers-PAM" },
  { name: "robots", content: "noindex" },
];

export default function NotFound() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav links={nav.links} />
      <main id="main">
        <Section id="not-found" eyebrow="404" heading="Page not found" lede="This page does not exist, or it has moved.">
          <p>
            <a className="button button--primary" href={siteHref("/")}>
              Back to the home page
            </a>
          </p>
        </Section>
      </main>
      <Footer tagline={footer.tagline} groups={footer.groups} marks={footer.marks} />
    </>
  );
}
