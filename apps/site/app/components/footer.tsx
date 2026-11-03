/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import { Fragment } from "react";

import { Mark } from "./mark";
import { siteHref } from "./site-href";

import "./marketing.css";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterGroup {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  tagline: string;
  groups: FooterGroup[];
  marks: string[];
}

// Splits the legal line into runs of plain text, each ending in a mark whose
// last word and ™ sit in a no-break span, so a line break can never land
// between the word and its mark. Each run is one text node, the same split
// as the docs footer's line, so the two are set glyph for glyph alike.
function legalRuns(marks: string[]) {
  return marks.map((mark, index) => {
    const lastSpace = mark.lastIndexOf(" ");
    const lead = (index > 0 ? " and " : "") + (lastSpace === -1 ? "" : mark.slice(0, lastSpace + 1));
    return { lead, word: lastSpace === -1 ? mark : mark.slice(lastSpace + 1) };
  });
}

// The one footer every page uses: the brand, the link groups, then the legal line.
export const Footer = ({ tagline, groups, marks }: FooterProps) => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <p className="footer__name">
              <Mark size={24} />
              sneakers·pam
            </p>
            <p className="footer__tagline">{tagline}</p>
          </div>
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title} className="footer__group">
              <h2 className="footer__heading">{group.title}</h2>
              <ul className="footer__links">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a href={siteHref(link.href)}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="footer__legal">
          {legalRuns(marks).map(({ lead, word }) => (
            <Fragment key={word}>
              {lead}
              <span className="nowrap">
                {word}
                <sup className="tm">™</sup>
              </span>
            </Fragment>
          ))}
          {` ${marks.length > 1 ? "are trademarks" : "is a trademark"} of the Sneakers-PAM project. © ${year} The Sneakers-PAM Authors. Licensed under Apache-2.0.`}
        </p>
      </div>
    </footer>
  );
};
