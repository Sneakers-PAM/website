/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// The trust center's control view: which statuses are shown and how the list
// is sorted, kept in the URL hash so a filtered view can be shared. Pure
// functions only; the component holds the state and the prerendered page uses
// the default view, so every control is listed without JavaScript.
import type { Control, ControlStatus } from "./types.ts";

export const STATUSES: ControlStatus[] = ["shipped", "main", "partial", "planned"];

export type SortKey = "area" | "status";

export interface View {
  // Empty means no filter: every status is shown.
  statuses: ControlStatus[];
  sort: SortKey;
}

export const DEFAULT_VIEW: View = { statuses: [], sort: "area" };

const isStatus = (value: string): value is ControlStatus => (STATUSES as string[]).includes(value);

const inStatusOrder = (statuses: Iterable<ControlStatus>) => {
  const chosen = new Set(statuses);
  return STATUSES.filter((s) => chosen.has(s));
};

export const countByStatus = (controls: Control[]): Record<ControlStatus, number> => {
  const counts = { shipped: 0, main: 0, partial: 0, planned: 0 };
  for (const c of controls) counts[c.status] += 1;
  return counts;
};

export const toggleStatus = (view: View, status: ControlStatus): View => {
  const chosen = new Set(view.statuses);
  if (chosen.has(status)) chosen.delete(status);
  else chosen.add(status);
  return { ...view, statuses: inStatusOrder(chosen) };
};

// A stable sort: within a status the register order (area by area) holds.
export const sortControls = (controls: Control[], sort: SortKey): Control[] => {
  if (sort === "area") return [...controls];
  return controls
    .map((c, index) => ({ c, index }))
    .sort((a, b) => STATUSES.indexOf(a.c.status) - STATUSES.indexOf(b.c.status) || a.index - b.index)
    .map(({ c }) => c);
};

export const visibleControls = (controls: Control[], view: View): Control[] => {
  const chosen = new Set(view.statuses);
  const kept = chosen.size ? controls.filter((c) => chosen.has(c.status)) : controls;
  return sortControls(kept, view.sort);
};

export const formatHash = (view: View): string => {
  const parts: string[] = [];
  if (view.statuses.length) parts.push(`status=${inStatusOrder(view.statuses).join(",")}`);
  if (view.sort !== DEFAULT_VIEW.sort) parts.push(`sort=${view.sort}`);
  return parts.length ? `#${parts.join("&")}` : "";
};

// Anything that isn't a view (an area anchor such as #area-keys, a typo, a
// status that no longer exists) falls back to the default view.
export const parseHash = (hash: string): View => {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw.includes("=")) return DEFAULT_VIEW;
  const params = new URLSearchParams(raw);
  const statuses = inStatusOrder((params.get("status") ?? "").split(",").filter(isStatus));
  const sort: SortKey = params.get("sort") === "status" ? "status" : "area";
  return { statuses, sort };
};
