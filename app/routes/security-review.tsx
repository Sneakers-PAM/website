/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type { MetaFunction } from "react-router";

import { areas, controls } from "~/content/trust/controls";
import { evidenceHref, issueHref, issueLabel, mappingLine, statusLabel } from "~/content/trust/links";
import { review } from "~/content/trust/review";
import type { Block, Control } from "~/content/trust/types";

import "~/components/security-review.css";

// The print source for the security review PDF (scripts/build-security-pdf.mjs).
// It is prerendered with the site but kept out of search and navigation.
export const meta: MetaFunction = () => [
  { title: `${review.title} ${review.docVersion}` },
  { name: "robots", content: "noindex" },
];

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "p":
      return <p>{block.text}</p>;
    case "list":
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "table":
      return (
        <table className="sr-table">
          <thead>
            <tr>
              {block.head.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.join("|")}>
                {row.map((cell, i) => (
                  <td key={i}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case "flow":
      return (
        <figure className="sr-flow">
          <figcaption>{block.title}</figcaption>
          <ol>
            {block.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </figure>
      );
    case "note":
      return <p className={`sr-note sr-note--${block.tone}`}>{block.text}</p>;
  }
}

function ControlRows({ items }: { items: Control[] }) {
  return (
    <table className="sr-table sr-controls">
      <thead>
        <tr>
          <th scope="col">Control</th>
          <th scope="col">Status</th>
          <th scope="col">Evidence</th>
        </tr>
      </thead>
      <tbody>
        {items.map((c) => (
          <tr key={c.id}>
            <td>
              <strong>
                {c.id} {c.title}
              </strong>
              <br />
              {c.statement}
              <span className="sr-map">{mappingLine(c)}</span>
            </td>
            <td className={`sr-status sr-status--${c.status}`}>{statusLabel(c)}</td>
            <td className="sr-evidence">
              {c.evidence.map((e) => (
                <span key={`${e.repo}/${e.path}/${e.detail ?? ""}`}>
                  <a href={evidenceHref(e)}>
                    {e.repo}/{e.path}
                  </a>
                  {e.detail ? ` (${e.detail})` : ""}
                </span>
              ))}
              {c.gaps?.map((g) => (
                <span key={issueLabel(g)} className="sr-gap">
                  Gap: <a href={issueHref(g)}>{issueLabel(g)}</a> {g.title}
                </span>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function SecurityReview() {
  const gaps = controls.filter((c) => c.status === "partial" || c.status === "planned");
  return (
    <div className="sr">
      <style>{`@page { @top-left { content: "${review.title}"; } @top-right { content: "${review.docVersion} · ${review.date}"; } }`}</style>

      <section className="sr-cover">
        <img src={`${import.meta.env.BASE_URL}img/mark-light.svg`} width={88} height={88} alt="" />
        <p className="sr-cover__eyebrow">sneakers·pam</p>
        <h1>{review.title}</h1>
        <p className="sr-cover__subtitle">{review.subtitle}</p>
        <dl className="sr-cover__meta">
          <dt>Document</dt>
          <dd>{review.docVersion}</dd>
          <dt>Date</dt>
          <dd>{review.date}</dd>
          <dt>Product version</dt>
          <dd>{review.productVersion}</dd>
          <dt>Classification</dt>
          <dd>{review.classification}</dd>
        </dl>
        <p className="sr-cover__disclaimer">{review.disclaimer}</p>
      </section>

      <nav className="sr-toc" aria-label="Contents">
        <h2>Contents</h2>
        <ol>
          {review.sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>{s.title}</a>
            </li>
          ))}
          <li>
            <a href="#gaps">Gaps and planned work</a>
          </li>
          <li>
            <a href="#crosswalk">Framework crosswalk</a>
          </li>
        </ol>
      </nav>

      {review.sections.map((s) => (
        <section key={s.id} id={s.id} className="sr-section">
          <h2>{s.title}</h2>
          {s.blocks.map((b, i) => (
            <BlockView key={i} block={b} />
          ))}
          {s.areas?.map((areaId) => {
            const area = areas.find((a) => a.id === areaId);
            const items = controls.filter((c) => c.area === areaId);
            return area && items.length ? (
              <div key={areaId} className="sr-area">
                <h3>Controls: {area.title}</h3>
                <ControlRows items={items} />
              </div>
            ) : null;
          })}
        </section>
      ))}

      <section id="gaps" className="sr-section">
        <h2>Gaps and planned work</h2>
        <p>{review.gapsIntro}</p>
        <ControlRows items={gaps} />
      </section>

      <section id="crosswalk" className="sr-section">
        <h2>Framework crosswalk</h2>
        <p>{review.crosswalkIntro}</p>
        <table className="sr-table sr-crosswalk">
          <thead>
            <tr>
              <th scope="col">Control</th>
              <th scope="col">SOC 2 TSC</th>
              <th scope="col">ISO 27001:2022 Annex A</th>
              <th scope="col">NIST SP 800-63B</th>
              <th scope="col">OWASP ASVS 4.0.3</th>
            </tr>
          </thead>
          <tbody>
            {controls.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.id} {c.title}
                </td>
                <td>{c.mappings.soc2?.join(", ") ?? ""}</td>
                <td>{c.mappings.iso27001?.join(", ") ?? ""}</td>
                <td>{c.mappings.nist80063b?.join(", ") ?? ""}</td>
                <td>{c.mappings.asvs?.join(", ") ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
