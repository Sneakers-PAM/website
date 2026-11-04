/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// Takes emoji out of a label or heading, for navigation that reads as plain
// text (the docs sidebar and table of contents) while the page itself keeps
// them. Only what renders as emoji goes: characters that default to emoji
// presentation, or any pictograph forced to it with U+FE0F, along with their
// skin-tone modifiers and joined sequences. Text symbols such as the trademark,
// copyright and registered signs, and arrows, stay.
const EMOJI =
  /(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}\u{FE0F})(?:\p{Emoji_Modifier}|\u{FE0F}|\u{200D}(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}\u{FE0F}?))*\s*/gu;

export function stripEmoji(text: string): string {
  return text
    .replace(EMOJI, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
