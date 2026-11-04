/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// How the breadcrumb line (src/theme/DocBreadcrumbs) folds a trail that
// doesn't fit beside the doc toolbar: the crumbs above the current page go,
// oldest first, into one "…" item whose title names them, so the page keeps
// its full name whenever it fits. Once every other crumb has folded, the
// page's own name ends in an ellipsis (CSS) instead.

export const FOLD_MARK = '…';
export const TRAIL_SEPARATOR = ' › ';

// The fold count after one measure: one more while the trail overflows or the
// page's name is cut, never folding the current page itself.
export function nextFold({
  folded,
  count,
  overflows,
  cut,
}: {
  folded: number;
  count: number;
  overflows: boolean;
  cut: boolean;
}): number {
  if (folded >= count - 1) return folded;
  return overflows || cut ? folded + 1 : folded;
}

// The crumbs to draw: the "…" item (index -1) for the folded ones, then
// the rest with their index in the full trail.
export function visibleCrumbs(labels: string[], folded: number): {label: string; index: number}[] {
  const rest = labels.slice(folded).map((label, offset) => ({label, index: folded + offset}));
  return folded > 0 ? [{label: FOLD_MARK, index: -1}, ...rest] : rest;
}

export function foldedTitle(labels: string[], folded: number): string {
  return labels.slice(0, folded).join(TRAIL_SEPARATOR);
}
