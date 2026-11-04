/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type {ReactNode} from 'react';
import {useActivePlugin} from '@docusaurus/plugin-content-docs/client';
import {useBrowserConsent} from '@sneakers-pam/frame/use-consent';
import {isFullWidth, setFullWidth} from '@sneakers-pam/frame/full-width';
import {FullWidthToggle} from '@sneakers-pam/frame/full-width-toggle';

import {DocsVersionNavbarItem} from '@site/src/components/docs-version-navbar-item';
import {DOCS_CONSENT_PREFIX} from '@site/src/lib/consent';

// The doc toolbar, at the top right of the doc column on the breadcrumb
// line (src/theme/DocBreadcrumbs): the version picker and the full-width
// switch from packages/frame. Keeping them out of the header leaves the
// header the site's, item for item, at every width. On a narrow screen the
// toolbar takes a line under the breadcrumbs. The switch reads the stored
// choice only once the page has hydrated, so the first render matches the
// prerendered page.
export function DocToolbar(): ReactNode {
  const activePlugin = useActivePlugin();
  const {consent} = useBrowserConsent(DOCS_CONSENT_PREFIX);
  if (!activePlugin) return null;
  const full = consent ? isFullWidth(consent) : false;
  return (
    <div className="doc-toolbar">
      <DocsVersionNavbarItem
        docsPluginId={activePlugin.pluginId}
        className="doc-toolbar__version"
        dropdownActiveClassDisabled
        dropdownItemsBefore={[]}
        dropdownItemsAfter={[]}
        // The dropdown builds its own items from the versions.
        items={[]}
      />
      <div className="doc-toolbar__width">
        <FullWidthToggle
          full={full}
          onToggle={() => consent && setFullWidth(consent, !full, document.documentElement)}
        />
      </div>
    </div>
  );
}
