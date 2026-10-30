/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
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

// Renders a mark with its ™ bound to the last word in a no-break span,
// so a line break can never land between the word and its mark.
function MarkedTerm({ mark }: { mark: string }) {
  const lastSpace = mark.lastIndexOf(" ");
  const rest = lastSpace === -1 ? "" : mark.slice(0, lastSpace + 1);
  const lastWord = lastSpace === -1 ? mark : mark.slice(lastSpace + 1);
  return (
    <>
      {rest}
      <span className="nowrap">
        {lastWord}
        <sup className="tm">™</sup>
      </span>
    </>
  );
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
              <img src={`${import.meta.env.BASE_URL}img/mark-light.svg`} width={24} height={24} alt="" />
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
          {marks.map((mark, index) => (
            <span key={mark}>
              {index > 0 && " and "}
              <MarkedTerm mark={mark} />
            </span>
          ))}{" "}
          {marks.length > 1 ? "are trademarks" : "is a trademark"} of the Sneakers-PAM
          project. &copy; {year} The Sneakers-PAM Authors. Licensed under Apache-2.0.
        </p>
      </div>
    </footer>
  );
};
