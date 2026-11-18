/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type {ReactNode} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDocsVersion} from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import {vnextBannerText} from '@site/src/lib/vnext-banner';
import {withdrawnBannerText, withdrawnUse} from '@site/src/lib/withdrawn';

// The banner on every vNext page (the unreleased "current" version), naming
// the release that may ship it and the current one (packages/frame
// release.ts, passed in customFields), and on every page of a withdrawn
// version (src/lib/withdrawn.ts), naming the version to use. Other released
// versions get no banner.
export default function DocVersionBanner({className}: {className?: string}): ReactNode {
  const version = useDocsVersion();
  const {siteConfig} = useDocusaurusContext();
  const use = withdrawnUse(version.version);
  if (use) {
    return (
      <div
        className={clsx(className, ThemeClassNames.docs.docVersionBanner, 'alert alert--danger margin-bottom--md')}
        role="alert">
        {withdrawnBannerText(version.version, use)}
      </div>
    );
  }
  if (version.version !== 'current') return null;
  return (
    <div
      className={clsx(className, ThemeClassNames.docs.docVersionBanner, 'alert alert--warning margin-bottom--md')}
      role="alert">
      {vnextBannerText(siteConfig.customFields?.releaseVersion as string)}
    </div>
  );
}
