/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import { evidenceHref, issueHref, issueLabel, mappingLine, statusLabel } from "~/content/trust/links";
import type { Area, Control, SubProcessor, TrustDocument } from "~/content/trust/types";

import { siteHref } from "./site-href";

import "./marketing.css";
import "./trust.css";

export const StatusBadge = ({ control }: { control: Control }) => (
  <span className={`status status--${control.status}`}>{statusLabel(control)}</span>
);

export const ControlCard = ({ control }: { control: Control }) => (
  <li className="control-card" id={control.id}>
    <div className="control-card__head">
      <h4 className="control-card__title">{control.title}</h4>
      <StatusBadge control={control} />
    </div>
    <p className="control-card__body">{control.statement}</p>
    <p className="control-card__map">{mappingLine(control)}</p>
    {control.evidence.length ? (
      <details className="control-card__evidence">
        <summary>Evidence ({control.evidence.length})</summary>
        <ul>
          {control.evidence.map((e) => (
            <li key={`${e.repo}/${e.path}/${e.detail ?? ""}`}>
              <span className="evidence-kind">{e.kind}</span>{" "}
              <a href={evidenceHref(e)}>
                {e.repo}/{e.path}
              </a>
              {e.detail ? <> &middot; {e.detail}</> : null}
            </li>
          ))}
        </ul>
      </details>
    ) : null}
    {control.gaps?.length ? (
      <p className="control-card__gaps">
        Open work:{" "}
        {control.gaps.map((g, i) => (
          <span key={issueLabel(g)}>
            {i > 0 ? ", " : ""}
            <a href={issueHref(g)}>{issueLabel(g)}</a> {g.title}
          </span>
        ))}
      </p>
    ) : null}
  </li>
);

export const AreaBlock = ({ area, controls }: { area: Area; controls: Control[] }) => (
  <div className="area" id={`area-${area.id}`}>
    <h3 className="area__title">{area.title}</h3>
    <p className="area__summary">{area.summary}</p>
    <ul className="control-list">
      {controls.map((c) => (
        <ControlCard key={c.id} control={c} />
      ))}
    </ul>
  </div>
);

export const PostureTiles = ({ controls }: { controls: Control[] }) => {
  const count = (s: Control["status"]) => controls.filter((c) => c.status === s).length;
  const tiles = [
    { label: "Controls shipped", value: count("shipped") },
    { label: "Built, next release", value: count("main") },
    { label: "Partial", value: count("partial") },
    { label: "Planned", value: count("planned") },
  ].filter((t) => t.value > 0);
  return (
    <ul className="posture-tiles">
      {tiles.map((t) => (
        <li key={t.label} className="posture-tile">
          <span className="posture-tile__value">{t.value}</span>
          <span className="posture-tile__label">{t.label}</span>
        </li>
      ))}
    </ul>
  );
};

export const DocumentList = ({ documents }: { documents: TrustDocument[] }) => (
  <ul className="feature-grid">
    {documents.map((d) => (
      <li key={d.title} className="feature-card">
        <h3 className="feature-card__title">{d.title}</h3>
        <p className="feature-card__body">{d.summary}</p>
        <p className="feature-card__body">
          <a href={siteHref(d.href)} download={d.href.endsWith(".pdf") ? "" : undefined}>
            {d.action ?? "Read it"}
          </a>
        </p>
      </li>
    ))}
  </ul>
);

export const SubProcessorTable = ({ rows }: { rows: SubProcessor[] }) => (
  <table className="downloads-table">
    <thead>
      <tr>
        <th scope="col">Service</th>
        <th scope="col">Purpose</th>
        <th scope="col">Data it sees</th>
        <th scope="col">Scope</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((r) => (
        <tr key={r.name}>
          <td>{r.name}</td>
          <td>{r.purpose}</td>
          <td>{r.data}</td>
          <td>{r.scope}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
