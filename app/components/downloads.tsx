import type { DownloadAsset } from "~/content/release";

import "./marketing.css";

interface DownloadsProps {
  version: string;
  pageHref: string;
  assets: DownloadAsset[];
  keyHref: string;
  keyFingerprint: string;
}

export const Downloads = ({ version, pageHref, assets, keyHref, keyFingerprint }: DownloadsProps) => (
  <>
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
      All files are on the {version} <a href={pageHref}>release page</a>. No ISO this release:
      install from the&nbsp;OVA.
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
