// The current release's downloads, in one place: a new release is a change
// to this file only. Sizes are the GitHub Release API's byte counts at the
// time this was written; the "How to verify" section checks them against
// SHA256SUMS and the cosign bundle instead of trusting this file.
const RELEASE_BASE = "https://github.com/Sneakers-PAM/sneakers-appliance/releases/download";

export const release = {
  version: "v0.1.0-rc.2",
  kind: "prerelease" as const,
  publishedOn: "2026-10-14",
  pageHref: "https://github.com/Sneakers-PAM/sneakers-appliance/releases/tag/v0.1.0-rc.2",
};

export interface DownloadAsset {
  label: string;
  name: string;
  sizeBytes: number;
  sizeLabel: string;
  href: string;
}

export const downloads: DownloadAsset[] = [
  {
    label: "Appliance OVA (install image)",
    name: "sneakers-appliance-0.1.0-rc.2-amd64.ova",
    sizeBytes: 93270016,
    sizeLabel: "88.9 MiB",
  },
  {
    label: "OVA checksum",
    name: "sneakers-appliance-0.1.0-rc.2-amd64.ova.sha256",
    sizeBytes: 106,
    sizeLabel: "106 B",
  },
  {
    label: "Product unit",
    name: "sneakers-product-0.1.0-rc.2-amd64.bin",
    sizeBytes: 1068698863,
    sizeLabel: "1019.2 MiB",
  },
  {
    label: "Base OS unit",
    name: "sneakers-appliance-baseOS-0.1.0-rc.2-amd64.bin",
    sizeBytes: 219160325,
    sizeLabel: "209.0 MiB",
  },
  {
    label: "Base OS patch (rc.1 to rc.2)",
    name: "sneakers-appliance-baseOS-patch-0.1.0-rc.1-to-0.1.0-rc.2-amd64.bin",
    sizeBytes: 7836558,
    sizeLabel: "7.5 MiB",
  },
  {
    label: "Checksums for every file above",
    name: "SHA256SUMS",
    sizeBytes: 570,
    sizeLabel: "570 B",
  },
  {
    label: "Signature bundle for SHA256SUMS",
    name: "SHA256SUMS.sigstore.json",
    sizeBytes: 383,
    sizeLabel: "383 B",
  },
].map((asset) => ({ ...asset, href: `${RELEASE_BASE}/${release.version}/${asset.name}` }));

// The production signing key is public and committed to sneakers-appliance;
// this is its raw-file location and the fingerprint from keys/production/
// fingerprints.txt, not a secret.
export const verify = {
  keyHref: "https://raw.githubusercontent.com/Sneakers-PAM/sneakers-appliance/main/keys/production/cosign.pub",
  keyFingerprint: "7774b27fa2cd7269ad1cf8259a278025f16cbd6af57a4597e0e67797021bfa4e", // gitleaks:allow (public key fingerprint, not a secret)
};
