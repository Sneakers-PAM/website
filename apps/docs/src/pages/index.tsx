import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import {release} from '@sneakers-pam/frame/release';

// The home page uses the website's home markup (website
// app/components/split-hero.tsx, terminal-card.tsx, section.tsx and
// feature-grid.tsx), with its classes styled from the shared site-frame.css,
// so the two home pages line up when switching between them. The hero's
// text and terminal are the website's (app/content/sneakers-pam.ts hero).

const meta = {
  title: 'Sneakers-PAM — privileged access, kept on a short leash',
  description:
    'Open-source privileged access management: vault, rotation, approvals, SSH brokering and an appliance. Apache-2.0.',
};

type LedeSegment = {
  text: string;
  accent?: boolean;
};

const hero = {
  eyebrow: `Sneakers-PAM ${release.version} is out`,
  headlineLine1: 'Privileged access,',
  headlineLine2: 'kept on a short',
  headlineLine2TmWord: 'leash',
  headlineLine2Stop: '.',
  lede: [
    {text: 'A vault for every privileged credential, with '},
    {text: 'approvals', accent: true},
    {text: ', '},
    {text: 'rotation', accent: true},
    {text: ' and an audit trail nobody can quietly edit — delivered as a '},
    {text: 'signed appliance', accent: true},
    {text: ' you own outright.'},
  ] satisfies LedeSegment[],
  primaryCta: {label: `Download ${release.version}`, href: 'https://www.sneakers-pam.com/#download'},
  secondaryCta: {label: 'View on GitHub', href: 'https://github.com/Sneakers-PAM'},
  terminal: {
    title: 'sneakers-run',
    lines: [
      '$ sneakers-run -secret prod/db-primary -- psql',
      'you can read this secret -- no approval needed',
      'connecting to db-primary.example.org ...',
      'logged: check-out by you, 08:14:02',
    ],
  },
};

type Feature = {
  title: string;
  body: string;
};

const features: Feature[] = [
  {
    title: 'One place for secrets',
    body: 'Credentials live in folders with their own access rules, never scattered across config files or chat threads.',
  },
  {
    title: 'Approvals, not blanket access',
    body: 'Reveals, check-outs and break-glass access can all require a reason and, where set up, a second approver.',
  },
  {
    title: 'Rotation you can trust',
    body: 'A heartbeat checks that a target still matches what the vault holds, and rotation runs on a schedule or on demand.',
  },
  {
    title: "An audit trail that can't be quietly edited",
    body: 'Every action is recorded in a hash-chained log; a changed, deleted or reordered record is detectable.',
  },
  {
    title: 'Built for agents too',
    body: 'An MCP server lets coding agents and other tools use secrets through the same approvals and audit trail as a person would.',
  },
  {
    title: 'Run it yourself',
    body: 'A signed, single-node appliance for VMware ESXi or Proxmox VE (amd64), or Helm charts for your own Kubernetes on amd64 or arm64. No hosted service required.',
  },
];

function Hero(): ReactNode {
  return (
    <section className="hero">
      <div className="hero__backdrop" aria-hidden="true" />
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="hero__eyebrow">{hero.eyebrow}</p>
          <h1 className="hero__headline">
            <span className="hero__headline-line">{hero.headlineLine1}</span>
            <span className="hero__headline-accent hero__headline-line">
              {hero.headlineLine2}{' '}
              <span className="nowrap">
                {hero.headlineLine2TmWord}
                <sup className="tm">™</sup>
                {hero.headlineLine2Stop}
              </span>
            </span>
          </h1>
          <p className="hero__lede">
            {hero.lede.map((segment, index) =>
              segment.accent ? <mark key={index}>{segment.text}</mark> : <span key={index}>{segment.text}</span>,
            )}
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" href={hero.primaryCta.href} target="_self">
              {hero.primaryCta.label}
            </Link>
            <Link className="button button--secondary" href={hero.secondaryCta.href} target="_self">
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>
        <div className="hero__aside">
          <div className="terminal" role="img" aria-label={`Illustrative terminal output: ${hero.terminal.title}`}>
            <div className="terminal__bar">
              <span className="terminal__dot" />
              <span className="terminal__dot" />
              <span className="terminal__dot" />
              <span className="terminal__title">{hero.terminal.title}</span>
            </div>
            <pre className="terminal__body">
              <code>
                {hero.terminal.lines.join('\n')}
                <span className="terminal__cursor" aria-hidden="true" />
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function Section({
  id,
  eyebrow,
  heading,
  lede,
  tone = 'default',
  children,
}: {
  id?: string;
  eyebrow?: string;
  heading: string;
  lede?: ReactNode;
  tone?: 'default' | 'card';
  children?: ReactNode;
}): ReactNode {
  return (
    <section id={id} className={tone === 'card' ? 'section section--card' : 'section'}>
      <div className="container">
        <div className="section__head">
          {eyebrow ? <p className="section__eyebrow">{eyebrow}</p> : null}
          <h2 className="section__heading">{heading}</h2>
          {lede ? <p className="section__lede">{lede}</p> : null}
        </div>
        {children ? <div className="section__body">{children}</div> : null}
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout description={meta.description}>
      <Head>
        <title>{meta.title}</title>
        <meta property="og:title" content={meta.title} />
        <meta property="og:type" content="website" />
      </Head>
      <main id="main">
        <Hero />
        <Section
          id="start"
          eyebrow="Docs"
          heading="Start here."
          lede="Getting started installs the appliance and signs you in; Concepts explains how folders, approvals and rotation fit together.">
          <div className="hero__actions">
            <Link className="button button--primary" to="/docs/getting-started">
              Getting started
            </Link>
            <Link className="button button--secondary" to="/docs/concepts">
              Concepts
            </Link>
          </div>
        </Section>
        <Section id="what-it-is" eyebrow="What it is" heading="One place for every privileged credential." tone="card">
          <ul className="feature-grid">
            {features.map((feature) => (
              <li key={feature.title} className="feature-card">
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__body">{feature.body}</p>
              </li>
            ))}
          </ul>
        </Section>
        <Section
          id="status"
          eyebrow="Status"
          heading="Pre-1.0 notice"
          lede={
            <>
              Sneakers-PAM is pre-1.0 and under active development. The services, the appliance and this site are
              all being built in the open as a from-scratch, open-source PAM. Interfaces, configuration and the
              install flow can still change before v0.1.0. Nothing here is ready for production use yet — most pages
              below mark what&apos;s still coming. Follow along or get involved on{' '}
              <Link href="https://github.com/Sneakers-PAM">GitHub</Link>; see{' '}
              <Link to="/docs/contributing">Contributing</Link> for how.
            </>
          }
        />
      </main>
    </Layout>
  );
}
