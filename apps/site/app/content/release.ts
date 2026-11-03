/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// The current release's downloads, in one place: a new release is a change
// to this file and to the version in packages/frame/release.ts. Sizes are
// the GitHub Release API's byte counts at the time this was written; the
// "How to verify" section checks them against SHA256SUMS and the cosign
// bundle instead of trusting this file.
import { release as current } from "@sneakers-pam/frame/release";

const RELEASE_BASE = "https://github.com/Sneakers-PAM/sneakers-appliance/releases/download";

export const release = {
  ...current,
  pageHref: `https://github.com/Sneakers-PAM/sneakers-appliance/releases/tag/${current.version}`,
};

// The same release as Helm charts for a Kubernetes cluster you run yourself.
// The charts aren't in a chart registry yet: they're installed from a checkout
// of sneakers-release at the release's tag. rc.3 is the first with linux/arm64
// images for every service; the install guide's CPU architecture section has
// the values an arm64 node needs.
export const kubernetes = {
  pageHref: `https://github.com/Sneakers-PAM/sneakers-release/releases/tag/${release.version}`,
  repoHref: "https://github.com/Sneakers-PAM/sneakers-release",
  chartPath: "charts/sneakers",
  chartVersion: "0.1.0",
  imageTag: release.version.slice(1),
  guideHref: `https://github.com/Sneakers-PAM/sneakers-release/blob/${release.version}/docs/install.md`,
  archDocHref: `https://github.com/Sneakers-PAM/sneakers-release/blob/${release.version}/docs/install.md#cpu-architecture`,
};

// The qcow2's install guide, read at the release's own tag so it matches the image.
export const proxmox = {
  guideHref: `https://github.com/Sneakers-PAM/sneakers-appliance/blob/${release.version}/docs/proxmox-vm.md`,
};

// The OVA's install guide lives on the docs site; the appliance repo has none.
export const esxi = {
  guideHref: "https://docs.sneakers-pam.com/docs/install-esxi",
};

// Every way to install, and where each one stands in this release. Only an
// available target links a guide. The appliance images and update files are
// amd64 only; the Helm charts' service images are multi-arch.
export interface InstallTarget {
  id: "ova" | "qcow2" | "helm" | "iso" | "ami";
  label: string;
  status: "Available" | "Not yet available" | "Being considered";
  arch: string;
  guideLabel?: string;
  guideHref?: string;
}

export const installTargets: InstallTarget[] = [
  {
    id: "ova",
    label: "OVA, for VMware ESXi and vCenter",
    status: "Available",
    arch: "amd64 only",
    guideLabel: "VMware ESXi guide",
    guideHref: esxi.guideHref,
  },
  {
    id: "qcow2",
    label: "Disk image (qcow2), for Proxmox VE",
    status: "Available",
    arch: "amd64 only",
    guideLabel: "Proxmox VE guide",
    guideHref: proxmox.guideHref,
  },
  {
    id: "helm",
    label: "Helm charts, for your own Kubernetes",
    status: "Available",
    arch: "amd64 and arm64",
    guideLabel: "Helm install guide",
    guideHref: kubernetes.guideHref,
  },
  { id: "iso", label: "ISO, for bare metal", status: "Not yet available", arch: "None published" },
  { id: "ami", label: "AWS AMI", status: "Being considered", arch: "None published" },
];

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
    name: "sneakers-appliance-0.1.0-rc.7-amd64.ova",
    sizeBytes: 100018176,
    sizeLabel: "95.4 MiB",
  },
  {
    label: "OVA checksum",
    name: "sneakers-appliance-0.1.0-rc.7-amd64.ova.sha256",
    sizeBytes: 106,
    sizeLabel: "106 B",
  },
  {
    label: "Proxmox VE disk image (qcow2)",
    name: "sneakers-appliance-0.1.0-rc.7-amd64.qcow2",
    sizeBytes: 239992832,
    sizeLabel: "228.9 MiB",
  },
  {
    label: "qcow2 checksum",
    name: "sneakers-appliance-0.1.0-rc.7-amd64.qcow2.sha256",
    sizeBytes: 108,
    sizeLabel: "108 B",
  },
  {
    label: "Product unit",
    name: "sneakers-product-0.1.0-rc.7-amd64.bin",
    sizeBytes: 1111079759,
    sizeLabel: "1059.6 MiB",
  },
  {
    label: "Base OS unit",
    name: "sneakers-appliance-baseOS-0.1.0-rc.7-amd64.bin",
    sizeBytes: 239298613,
    sizeLabel: "228.2 MiB",
  },
  {
    label: "Base OS patch (rc.6 to rc.7)",
    name: "sneakers-appliance-baseOS-patch-0.1.0-rc.6-to-0.1.0-rc.7-amd64.bin",
    sizeBytes: 18215791,
    sizeLabel: "17.4 MiB",
  },
  {
    label: "Base web unit",
    name: "sneakers-appliance-baseWeb-0.1.0-rc.7-amd64.bin",
    sizeBytes: 1282340,
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
