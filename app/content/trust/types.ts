/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// The one content model behind the trust center page and the security review
// PDF. Both render from these types; neither carries copy of its own.

// shipped: on a published tag. main: merged, not yet on a tag. partial: built,
// with a named gap. planned: not built, tracked by an open issue.
export type ControlStatus = "shipped" | "main" | "partial" | "planned";

// Every evidence link points at a public Sneakers-PAM repo; the content test
// rejects any repo outside PUBLIC_REPOS.
export const PUBLIC_REPOS = [
  "sneakers-appliance",
  "sneakers-audit",
  "sneakers-connector",
  "sneakers-gateway",
  "sneakers-identity",
  "sneakers-mcp",
  "sneakers-notify",
  "sneakers-release",
  "sneakers-sshbroker",
  "sneakers-vault",
  "sneakers-web",
  "sneakers-ios",
  "sneakers-android",
  "docs",
  "website",
  ".github",
] as const;

export type PublicRepo = (typeof PUBLIC_REPOS)[number];

export interface Evidence {
  repo: PublicRepo;
  path: string;
  kind: "code" | "test" | "doc" | "ci";
  // The test function, CI job or doc heading that proves the claim.
  detail?: string;
}

export interface IssueRef {
  repo: PublicRepo;
  number: number;
  title: string;
}

export interface Mappings {
  soc2?: string[];
  iso27001?: string[];
  nist80063b?: string[];
  asvs?: string[];
}

export interface Control {
  id: string;
  area: string;
  title: string;
  statement: string;
  status: ControlStatus;
  // The first tag the control ships in; omitted for main and planned.
  since?: string;
  evidence: Evidence[];
  mappings: Mappings;
  gaps?: IssueRef[];
}

export interface Area {
  id: string;
  title: string;
  summary: string;
}

export type Block =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "flow"; title: string; steps: string[] }
  | { kind: "note"; tone: "info" | "warn"; text: string };

export interface ReviewSection {
  id: string;
  title: string;
  blocks: Block[];
  // Areas whose controls are listed at the end of this section.
  areas?: string[];
}

export interface SubProcessor {
  name: string;
  purpose: string;
  data: string;
  scope: string;
}

export interface TrustDocument {
  title: string;
  summary: string;
  access: "public" | "on-request";
  href?: string;
}
