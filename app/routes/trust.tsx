/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type { MetaFunction } from "react-router";

import { Diagram } from "~/components/diagrams";
import { Footer } from "~/components/footer";
import { Nav } from "~/components/nav";
import { Section } from "~/components/section";
import { AreaBlock, DocumentList, PostureTiles, SubProcessorTable } from "~/components/trust";
import { footer, nav } from "~/content/sneakers-pam";
import { areas, controls } from "~/content/trust/controls";
import { trustCenter } from "~/content/trust/trust-center";

export const meta: MetaFunction = () => [
  { title: trustCenter.meta.title },
  { name: "description", content: trustCenter.meta.description },
];

export default function Trust() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav links={nav.links} />
      <main id="main">
        <Section id="posture" eyebrow="Trust center" heading={trustCenter.posture.heading} lede={trustCenter.posture.lede}>
          <ul className="area-nav" aria-label="On this page">
            {trustCenter.sections.map((s) => (
              <li key={s.href}>
                <a href={s.href}>{s.label}</a>
              </li>
            ))}
          </ul>
          <PostureTiles controls={controls} />
          {trustCenter.posture.notes.map((n) => (
            <p key={n} className="trust-note">
              {n}
            </p>
          ))}
        </Section>

        <Section id="architecture" eyebrow="Architecture" heading={trustCenter.architecture.heading} lede={trustCenter.architecture.lede} tone="card">
          {trustCenter.architecture.figures.map((f) => (
            <Diagram key={f.diagram} id={f.diagram} caption={f.caption} />
          ))}
        </Section>

        <Section id="controls" eyebrow="Controls" heading={trustCenter.controls.heading} lede={trustCenter.controls.lede} tone="card">
          <ul className="area-nav">
            {areas.map((a) => (
              <li key={a.id}>
                <a href={`#area-${a.id}`}>{a.title}</a>
              </li>
            ))}
          </ul>
          {areas.map((a) => (
            <AreaBlock key={a.id} area={a} controls={controls.filter((c) => c.area === a.id)} />
          ))}
        </Section>

        <Section id="documents" eyebrow="Documents" heading={trustCenter.documents.heading} lede={trustCenter.documents.lede}>
          <DocumentList documents={trustCenter.documents.items} requestHref={trustCenter.documents.requestHref} />
        </Section>

        <Section
          id="subprocessors"
          eyebrow="Sub-processors"
          heading={trustCenter.subprocessors.heading}
          lede={trustCenter.subprocessors.lede}
          tone="card"
        >
          <SubProcessorTable rows={trustCenter.subprocessors.rows} />
        </Section>

        <Section id="report" eyebrow="Report a vulnerability" heading={trustCenter.report.heading} lede={trustCenter.report.lede}>
          <ol className="prose">
            {trustCenter.report.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="prose">
            <a className="button button--primary" href={trustCenter.report.href}>
              {trustCenter.report.cta}
            </a>
          </p>
        </Section>
      </main>
      <Footer tagline={footer.tagline} groups={footer.groups} marks={footer.marks} />
    </>
  );
}
