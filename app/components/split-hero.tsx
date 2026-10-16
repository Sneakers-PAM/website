import type { ReactNode } from "react";

import type { LedeSegment } from "~/content/sneakers-pam";

import "./marketing.css";

interface Cta {
  label: string;
  href: string;
}

interface SplitHeroProps {
  eyebrow: string;
  headlineLine1: string;
  /** The accent line's text before the trademarked word. */
  headlineLine2: string;
  /** The trademarked word the ™ binds to (e.g. "leash"). */
  headlineLine2TmWord: string;
  /** Punctuation right after the ™, inside the same no-break span. */
  headlineLine2Stop: string;
  lede: LedeSegment[];
  primaryCta: Cta;
  secondaryCta: Cta;
  children: ReactNode;
}

// A two-column hero over a faint grid backdrop with a blurred radial glow,
// top-right. Reused by the "what makes it different" terminal card.
export const SplitHero = ({
  eyebrow,
  headlineLine1,
  headlineLine2,
  headlineLine2TmWord,
  headlineLine2Stop,
  lede,
  primaryCta,
  secondaryCta,
  children,
}: SplitHeroProps) => (
  <section className="hero">
    <div className="hero__backdrop" aria-hidden="true" />
    <div className="container hero__grid">
      <div className="hero__copy">
        <p className="hero__eyebrow">{eyebrow}</p>
        <h1 className="hero__headline">
          <span className="hero__headline-line">{headlineLine1}</span>
          <span className="hero__headline-accent hero__headline-line">
            {headlineLine2}{" "}
            <span className="nowrap">
              {headlineLine2TmWord}
              <sup className="tm">™</sup>
              {headlineLine2Stop}
            </span>
          </span>
        </h1>
        <p className="hero__lede">
          {lede.map((segment, index) =>
            segment.accent ? <mark key={index}>{segment.text}</mark> : <span key={index}>{segment.text}</span>,
          )}
        </p>
        <div className="hero__actions">
          <a className="button button--primary" href={primaryCta.href}>
            {primaryCta.label}
          </a>
          <a className="button button--secondary" href={secondaryCta.href}>
            {secondaryCta.label}
          </a>
        </div>
      </div>
      <div className="hero__aside">{children}</div>
    </div>
  </section>
);
