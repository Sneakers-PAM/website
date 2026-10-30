/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type { Control, ControlStatus, Evidence, IssueRef } from "./types.ts";

const org = "https://github.com/Sneakers-PAM";

export const evidenceHref = (e: Evidence) => `${org}/${e.repo}/blob/main/${e.path.replace(/:\d+$/, "")}`;

export const issueHref = (i: IssueRef) => `${org}/${i.repo}/issues/${i.number}`;

export const issueLabel = (i: IssueRef) => `${i.repo}#${i.number}`;

export const statusLabel = (c: Pick<Control, "status" | "since">) => {
  const labels: Record<ControlStatus, string> = {
    shipped: `Shipped${c.since ? ` in ${c.since}` : ""}`,
    main: "Built, next release",
    partial: `Partial${c.since ? ` since ${c.since}` : ""}`,
    planned: "Planned",
  };
  return labels[c.status];
};

export const mappingLine = (c: Control) =>
  [
    c.mappings.soc2?.length ? `SOC 2 ${c.mappings.soc2.join(", ")}` : "",
    c.mappings.iso27001?.length ? `ISO 27001 ${c.mappings.iso27001.join(", ")}` : "",
    c.mappings.nist80063b?.length ? `800-63B ${c.mappings.nist80063b.join(", ")}` : "",
    c.mappings.asvs?.length ? `ASVS ${c.mappings.asvs.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
