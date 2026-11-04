/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// The title and link-preview tags every route uses, so each page shares one
// shape: the title and description, Open Graph and the Twitter card, with
// absolute URLs, since link previews never resolve relative ones. Link
// previews (iMessage, Slack, social) read these, not <title>.
import type { MetaDescriptor } from "react-router";

export const SITE_NAME = "Sneakers-PAM";
export const SITE_URL = "https://www.sneakers-pam.com";

// The link-preview card from packages/brand (made from og-card.html),
// served at the site root. The docs point at the same picture.
export const OG_IMAGE = {
  path: "/img/og-card.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "The Sneakers-PAM mark and wordmark over the tagline: Privileged access, kept on a short leash.",
};

export interface PageMetaInput {
  title: string;
  description: string;
  /** The page's path on the live site, from the root. */
  path: string;
}

export const pageMeta = ({ title, description, path }: PageMetaInput): MetaDescriptor[] => {
  const url = `${SITE_URL}${path}`;
  const image = `${SITE_URL}${OG_IMAGE.path}`;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: String(OG_IMAGE.width) },
    { property: "og:image:height", content: String(OG_IMAGE.height) },
    { property: "og:image:type", content: OG_IMAGE.type },
    { property: "og:image:alt", content: OG_IMAGE.alt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: OG_IMAGE.alt },
  ];
};
