/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type { MetaFunction } from "react-router";

import { Downloads } from "~/components/downloads";
import { FeatureGrid } from "~/components/feature-grid";
import { Footer } from "~/components/footer";
import { Nav } from "~/components/nav";
import { Section } from "~/components/section";
import { SplitHero } from "~/components/split-hero";
import { TerminalCard } from "~/components/terminal-card";
import { different, footer, hero, meta as pageMeta, nav, whatItIs } from "~/content/sneakers-pam";
import { downloads, kubernetes, proxmox, release, verify } from "~/content/release";

export const meta: MetaFunction = () => [
  { title: pageMeta.title },
  { name: "description", content: pageMeta.description },
  { property: "og:site_name", content: pageMeta.siteName },
  { property: "og:title", content: pageMeta.title },
  { property: "og:description", content: pageMeta.description },
  { property: "og:type", content: "website" },
  { property: "og:url", content: pageMeta.url },
  { name: "twitter:card", content: pageMeta.twitterCard },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav links={nav.links} />
      <main id="main">
        <SplitHero
          eyebrow={hero.eyebrow}
          headlineLine1={hero.headlineLine1}
          headlineLine2={hero.headlineLine2}
          headlineLine2TmWord={hero.headlineLine2TmWord}
          headlineLine2Stop={hero.headlineLine2Stop}
          lede={hero.lede}
          primaryCta={hero.primaryCta}
          secondaryCta={hero.secondaryCta}
        >
          <TerminalCard title={hero.terminal.title} lines={hero.terminal.lines} />
        </SplitHero>

        <Section id="what-it-is" eyebrow={whatItIs.eyebrow} heading={whatItIs.heading} lede={whatItIs.lede}>
          <FeatureGrid items={whatItIs.features} />
        </Section>

        <Section
          id="different"
          eyebrow={different.eyebrow}
          heading={different.heading}
          lede={different.lede}
          tone="card"
        >
          <FeatureGrid items={different.features} />
        </Section>

        <Section
          id="download"
          eyebrow="Download"
          heading={`${release.version} is out`}
          lede={`Published ${release.publishedOn}. This is a prerelease: expect rough edges before v0.1.0.`}
        >
          <Downloads
            version={release.version}
            pageHref={release.pageHref}
            assets={downloads}
            keyHref={verify.keyHref}
            keyFingerprint={verify.keyFingerprint}
            kubernetesHref={kubernetes.pageHref}
            archDocHref={kubernetes.archDocHref}
            proxmoxGuideHref={proxmox.guideHref}
          />
        </Section>
      </main>
      <Footer tagline={footer.tagline} groups={footer.groups} marks={footer.marks} />
    </>
  );
}
