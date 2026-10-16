/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import "./marketing.css";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  marks: string[];
  links: FooterLink[];
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

export const Footer = ({ marks, links }: FooterProps) => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__row">
        <nav aria-label="Footer">
          <ul className="footer__links">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
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
