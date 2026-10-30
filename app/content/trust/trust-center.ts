/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type { DiagramId, SubProcessor, TrustDocument } from "./types.ts";

export const trustCenter = {
  meta: {
    title: "Trust center · Sneakers-PAM",
    description:
      "How Sneakers-PAM protects the credentials it holds: the controls by area, what is shipped and what is still open, and how to report a vulnerability.",
  },
  sections: [
    { label: "Posture", href: "#posture" },
    { label: "Architecture", href: "#architecture" },
    { label: "Controls", href: "#controls" },
    { label: "Documents", href: "#documents" },
    { label: "Sub-processors", href: "#subprocessors" },
    { label: "Report", href: "#report" },
  ],
  posture: {
    heading: "What protects your credentials, and what doesn't yet.",
    lede: "Every control below says what is built, the release it ships in and the code and tests that prove it. Gaps link the open issue that tracks them.",
    notes: [
      "Sneakers-PAM holds no certifications. It is open-source software you run yourself, not a hosted service, so there is no SOC 2 report or ISO 27001 certificate to share. The controls are mapped to SOC 2, ISO 27001, NIST SP 800-63B and OWASP ASVS so your own reviewers can test them.",
      "Sneakers-PAM is in prerelease (v0.1.0-rc.3). Expect the gaps listed here to change from one release candidate to the next.",
    ],
  },
  architecture: {
    heading: "How it fits together.",
    lede: "The services and where each trust boundary sits, then the appliance from firmware to product. The security review has the low-level design.",
    figures: [
      { diagram: "architecture", caption: "Architecture and trust boundaries. Every internal call is gRPC carrying a verified workload identity." },
      { diagram: "appliance-hld", caption: "The appliance, from firmware to product." },
    ] satisfies { diagram: DiagramId; caption: string }[],
  },
  controls: {
    heading: "Controls by area.",
    lede: "Shipped means the code is on a published tag. Partial means it's built with a named gap. Planned means it isn't built yet.",
  },
  documents: {
    heading: "Documents.",
    lede: "The security review is the long form of this page: architecture, data flows, key hierarchy and every control with its evidence.",
    requestHref: "https://github.com/Sneakers-PAM",
    items: [
      {
        title: "Security review",
        summary: "Architecture, data flows and every control mapped to SOC 2, ISO 27001, SP 800-63B and ASVS, with evidence. PDF.",
        access: "on-request",
      },
      {
        title: "Security policy",
        summary: "How to report a vulnerability and which versions get fixes.",
        access: "public",
        href: "https://github.com/Sneakers-PAM/.github/blob/main/.github/SECURITY.md",
      },
      {
        title: "Cryptography and export",
        summary: "The algorithms Sneakers uses and its export classification.",
        access: "public",
        href: "https://github.com/Sneakers-PAM/docs/blob/main/CRYPTO.md",
      },
      {
        title: "Key custody",
        summary: "How the appliance seals its keys in the TPM and escrows them to your recovery keys.",
        access: "public",
        href: "https://github.com/Sneakers-PAM/sneakers-appliance/blob/main/docs/key-custody.md",
      },
    ] satisfies TrustDocument[],
  },
  subprocessors: {
    heading: "Sub-processors.",
    lede: "Sneakers-PAM is self-hosted. The project runs no service that sees your secrets, users or audit trail. The only outside services are the project's own infrastructure and the ones you choose to connect.",
    rows: [
      {
        name: "GitHub",
        purpose: "Source code, CI, releases, container images and private vulnerability reports",
        data: "No customer data. An appliance or cluster pulls images and updates from it.",
        scope: "Project infrastructure",
      },
      {
        name: "Cloudflare Pages",
        purpose: "Hosts this website",
        data: "Visitors' requests to this site. No product data.",
        scope: "Project infrastructure",
      },
      {
        name: "Google Fonts",
        purpose: "Serves this website's typefaces",
        data: "Visitors' requests for font files. No product data.",
        scope: "Project infrastructure",
      },
      {
        name: "Your email relay",
        purpose: "Sign-in codes, password resets and notices",
        data: "Recipient addresses and message text, never a secret value",
        scope: "Chosen and run by you; none is bundled",
      },
      {
        name: "Your identity provider",
        purpose: "Optional SAML single sign-on",
        data: "Sign-in assertions for your users",
        scope: "Chosen and run by you",
      },
    ] satisfies SubProcessor[],
  },
  report: {
    heading: "Found a vulnerability? Tell us privately.",
    lede: "Please don't open a public issue, discussion or pull request for a suspected vulnerability.",
    steps: [
      "Open the affected repository on GitHub, go to the Security tab and choose Report a vulnerability.",
      "Say what you found, how to reproduce it, and the version or commit affected.",
      "Expect an acknowledgement within a few business days. We'll agree a fix and disclosure timeline with you, and credit you in the advisory unless you'd rather not be named.",
    ],
    cta: "Read the security policy",
    href: "https://github.com/Sneakers-PAM/.github/blob/main/.github/SECURITY.md",
  },
};
