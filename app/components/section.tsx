import type { ReactNode } from "react";

import "./marketing.css";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  heading: string;
  lede?: string;
  tone?: "default" | "card";
  children: ReactNode;
}

export const Section = ({ id, eyebrow, heading, lede, tone = "default", children }: SectionProps) => (
  <section id={id} className={tone === "card" ? "section section--card" : "section"}>
    <div className="container">
      <div className="section__head">
        {eyebrow ? <p className="section__eyebrow">{eyebrow}</p> : null}
        <h2 className="section__heading">{heading}</h2>
        {lede ? <p className="section__lede">{lede}</p> : null}
      </div>
      <div className="section__body">{children}</div>
    </div>
  </section>
);
