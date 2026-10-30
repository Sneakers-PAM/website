/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// Content layer: the page and every component stay the same shape; a new
// release only changes this file and release.ts.
export interface LedeSegment {
  text: string;
  accent?: boolean;
}

export const meta = {
  title: "Sneakers-PAM — privileged access, kept on a short leash",
  // The org profile's one-line description, word for word.
  description:
    "Open-source privileged access management: vault, rotation, approvals, SSH brokering and an appliance. Apache-2.0.",
  // Link previews (iMessage, Slack, social) read these, not <title>.
  siteName: "Sneakers-PAM",
  url: "https://www.sneakers-pam.com/",
  twitterCard: "summary",
};

export const nav = {
  links: [
    { label: "What it is", href: "/#what-it-is" },
    { label: "What's different", href: "/#different" },
    { label: "Download", href: "/#download" },
    { label: "Trust", href: "/trust" },
    { label: "GitHub", href: "https://github.com/Sneakers-PAM" },
  ],
};

export const hero = {
  eyebrow: `Sneakers-PAM ${"v0.1.0-rc.3"} is out, now on Raspberry Pi`,
  headlineLine1: "Privileged access,",
  headlineLine2: "kept on a short",
  headlineLine2TmWord: "leash",
  headlineLine2Stop: ".",
  lede: [
    { text: "A vault for every privileged credential, with " },
    { text: "approvals", accent: true },
    { text: ", " },
    { text: "rotation", accent: true },
    { text: " and an audit trail nobody can quietly edit — delivered as a " },
    { text: "signed appliance", accent: true },
    { text: " you own outright." },
  ] satisfies LedeSegment[],
  primaryCta: { label: "Download v0.1.0-rc.3", href: "#download" },
  secondaryCta: { label: "View on GitHub", href: "https://github.com/Sneakers-PAM" },
  terminal: {
    title: "sneakers-run",
    lines: [
      "$ sneakers-run -secret prod/db-primary -- psql",
      "you can read this secret -- no approval needed",
      "connecting to db-primary.example.org ...",
      "logged: check-out by you, 08:14:02",
    ],
  },
};

export const whatItIs = {
  eyebrow: "What it is",
  heading: "One place for every privileged credential.",
  lede: "Folders set the rules; nobody approves their own request, and one task gets one prompt.",
  features: [
    {
      title: "A vault with folders and rules",
      body: "Credentials live behind the access rules each folder sets, instead of spreadsheets, ticket comments and chat.",
    },
    {
      title: "Check-out, requests and approvals",
      body: "Reveals, check-outs and break-glass access can require a reason and, where set up, a second approver.",
    },
    {
      title: "Rotation you can trust",
      body: "A heartbeat checks that a target still matches what the vault holds, and rotation runs on a schedule or on demand.",
    },
    {
      title: "An audit trail nobody can quietly edit",
      body: "Every action is recorded in a hash-chained log; a changed, deleted or reordered record is detectable.",
    },
  ],
};

export const different = {
  eyebrow: "What makes it different",
  heading: "Built to be owned, not rented.",
  lede: "No per-seat pricing and no cloud account to open.",
  features: [
    {
      title: "Open source",
      body: "Apache-2.0, with no organisation-specific core. Read it, build it, or run someone else's build of it.",
    },
    {
      title: "The MCP built in",
      body: "An agent signs in with its own token, never a person's password, and uses a secret through the same approvals and audit trail a person would.",
    },
    {
      title: "Strong security design",
      body: "A signed, single-node appliance with its own rollback path, TPM-backed disk encryption, and nothing that trusts a request just because it asked twice.",
    },
    {
      title: "Free",
      body: "No tiers and no seat count. Run it on your own hypervisor, offline if you want to, or on Kubernetes down to a Raspberry Pi.",
    },
  ],
};

export const footer = {
  marks: ["Sneakers-PAM", "Privileged access, kept on a short leash"],
  tagline: "Open-source privileged access management you run yourself.",
  groups: [
    {
      title: "Product",
      links: [
        { label: "What it is", href: "/#what-it-is" },
        { label: "What's different", href: "/#different" },
        { label: "Download", href: "/#download" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Docs", href: "https://docs.sneakers-pam.com" },
        { label: "GitHub", href: "https://github.com/Sneakers-PAM" },
        { label: "Releases", href: "https://github.com/Sneakers-PAM/sneakers-release/releases" },
      ],
    },
    {
      title: "Trust",
      links: [
        { label: "Trust center", href: "/trust" },
        { label: "Security policy", href: "https://github.com/Sneakers-PAM/.github/blob/main/.github/SECURITY.md" },
        { label: "Report a vulnerability", href: "/trust#report" },
      ],
    },
  ],
};
