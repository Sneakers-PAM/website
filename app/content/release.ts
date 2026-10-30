/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// The current release's downloads, in one place: a new release is a change
// to this file only. Sizes are the GitHub Release API's byte counts at the
// time this was written; the "How to verify" section checks them against
// SHA256SUMS and the cosign bundle instead of trusting this file.
const RELEASE_BASE = "https://github.com/Sneakers-PAM/sneakers-appliance/releases/download";

export const release = {
  version: "v0.1.0-rc.4",
  kind: "prerelease" as const,
  publishedOn: "2026-10-30",
  pageHref: "https://github.com/Sneakers-PAM/sneakers-appliance/releases/tag/v0.1.0-rc.4",
};

// The same release as Helm charts for a Kubernetes cluster you run yourself.
// rc.3 is the first with linux/arm64 images for every service; the install
// guide's CPU architecture section has the values an arm64 node needs.
export const kubernetes = {
  pageHref: `https://github.com/Sneakers-PAM/sneakers-release/releases/tag/${release.version}`,
  archDocHref: "https://github.com/Sneakers-PAM/sneakers-release/blob/main/docs/install.md#cpu-architecture",
};

// The qcow2's install guide, read at the release's own tag so it matches the image.
export const proxmox = {
  guideHref: `https://github.com/Sneakers-PAM/sneakers-appliance/blob/${release.version}/docs/proxmox-vm.md`,
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
    name: "sneakers-appliance-0.1.0-rc.4-amd64.ova",
    sizeBytes: 98805760,
    sizeLabel: "94.2 MiB",
  },
  {
    label: "OVA checksum",
    name: "sneakers-appliance-0.1.0-rc.4-amd64.ova.sha256",
    sizeBytes: 106,
    sizeLabel: "106 B",
  },
  {
    label: "Proxmox VE disk image (qcow2, new and untested on a real Proxmox VE host)",
    name: "sneakers-appliance-0.1.0-rc.4-amd64.qcow2",
    sizeBytes: 233570304,
    sizeLabel: "222.8 MiB",
  },
  {
    label: "qcow2 checksum",
    name: "sneakers-appliance-0.1.0-rc.4-amd64.qcow2.sha256",
    sizeBytes: 108,
    sizeLabel: "108 B",
  },
  {
    label: "Product unit",
    name: "sneakers-product-0.1.0-rc.4-amd64.bin",
    sizeBytes: 1070756063,
    sizeLabel: "1021.2 MiB",
  },
  {
    label: "Base OS unit",
    name: "sneakers-appliance-baseOS-0.1.0-rc.4-amd64.bin",
    sizeBytes: 232835589,
    sizeLabel: "222.0 MiB",
  },
  {
    label: "Base OS patch (rc.3 to rc.4)",
    name: "sneakers-appliance-baseOS-patch-0.1.0-rc.3-to-0.1.0-rc.4-amd64.bin",
    sizeBytes: 9138382,
    sizeLabel: "8.7 MiB",
  },
  {
    label: "Base web unit",
    name: "sneakers-appliance-baseWeb-0.1.0-rc.4-amd64.bin",
    sizeBytes: 1256228,
    sizeLabel: "1.2 MiB",
  },
  {
    label: "Checksums for every file above",
    name: "SHA256SUMS",
    sizeBytes: 678,
    sizeLabel: "678 B",
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
