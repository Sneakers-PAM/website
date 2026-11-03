/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type { DownloadAsset, InstallTarget } from "~/content/release";

import "./marketing.css";

interface DownloadsProps {
  version: string;
  pageHref: string;
  assets: DownloadAsset[];
  targets: InstallTarget[];
  chart: { repoHref: string; chartPath: string; chartVersion: string; imageTag: string };
  keyHref: string;
  keyFingerprint: string;
  kubernetesHref: string;
  archDocHref: string;
}

export const Downloads = ({
  version,
  pageHref,
  assets,
  targets,
  chart,
  keyHref,
  keyFingerprint,
  kubernetesHref,
  archDocHref,
}: DownloadsProps) => (
  <>
    <table className="downloads-table">
      <thead>
        <tr>
          <th>Install target</th>
          <th>Status</th>
          <th>CPU</th>
        </tr>
      </thead>
      <tbody>
        {targets.map((target) => (
          <tr key={target.id}>
            <td>
              {target.label}
              {target.guideHref && (
                <div className="prose" style={{ fontSize: "0.8125rem", margin: 0 }}>
                  <a href={target.guideHref}>{target.guideLabel}</a>
                </div>
              )}
            </td>
            <td>{target.status}</td>
            <td>{target.arch}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <p className="prose">
      The appliance is amd64 only: the OVA, the qcow2 and its update files. The Helm charts&apos;
      images are built for amd64 and arm64.
    </p>

    <h3>Download the appliance</h3>
    <table className="downloads-table">
      <thead>
        <tr>
          <th>File</th>
          <th>Size</th>
        </tr>
      </thead>
      <tbody>
        {assets.map((asset) => (
          <tr key={asset.name}>
            <td>
              <a href={asset.href}>
                <code>{asset.name}</code>
              </a>
              <div className="prose" style={{ fontSize: "0.8125rem", margin: 0 }}>
                {asset.label}
              </div>
            </td>
            <td>{asset.sizeLabel}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <p className="prose dl-note">
      All files are on the {version} <a href={pageHref}>release page</a>. There&apos;s no ISO yet:
      a bare-metal install isn&apos;t available in this release.
    </p>
    <p className="prose dl-note dl-known-issue">
      Known issue: a box can stay stuck if it loses power right after the database move, so don&apos;t
      cut power during an upgrade to this release or straight after it. It&apos;s tracked in{" "}
      <a href="https://github.com/Sneakers-PAM/sneakers-appliance/issues/579">
        sneakers-appliance#579
      </a>
      .
    </p>

    <h3>Install with Helm</h3>
    <p className="prose">
      The Helm charts install the same release on a Kubernetes cluster you run, on amd64 or arm64,
      down to a Raspberry Pi. The chart is <code>{chart.chartPath}</code> (version{" "}
      {chart.chartVersion}) in <a href={chart.repoHref}>sneakers-release</a> at the {version}{" "}
      <a href={kubernetesHref}>tag</a>, installed from a checkout with{" "}
      <code>global.imageTag={chart.imageTag}</code>. On arm64, set the values from the install
      guide&apos;s <a href={archDocHref}>CPU architecture</a> section.
    </p>

    <h3>How to verify</h3>
    <p className="prose">Check the files against the checksums:</p>
    <pre className="verify-block">sha256sum -c SHA256SUMS --ignore-missing</pre>
    <p className="prose">
      Then check that <code>SHA256SUMS</code> itself was signed with the production release key (
      <a href={keyHref}>cosign.pub</a>, fingerprint <code>{keyFingerprint}</code>):
    </p>
    <pre className="verify-block">{`cosign verify-blob --key cosign.pub \\
  --bundle SHA256SUMS.sigstore.json \\
  --insecure-ignore-tlog=true \\
  SHA256SUMS`}</pre>
  </>
);
