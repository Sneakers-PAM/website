/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// The architecture and appliance diagrams, drawn as inline SVG so the trust
// center and the security review PDF show the same figures. Colours come from
// the Laces tokens in diagrams.css.
import type { ReactNode } from "react";

import type { DiagramId } from "~/content/trust/types";

import "./diagrams.css";

type Tone = "default" | "edge" | "core" | "data" | "ext" | "key" | "os" | "warn";

interface BoxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  tone?: Tone;
}

const Box = ({ x, y, w, h, title, sub, tone = "default" }: BoxProps) => (
  <g className={`dg-box dg-box--${tone}`}>
    <rect x={x} y={y} width={w} height={h} rx={8} />
    <text x={x + w / 2} y={sub ? y + h / 2 - 3 : y + h / 2 + 5} textAnchor="middle" className="dg-title">
      {title}
    </text>
    {sub ? (
      <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle" className="dg-sub">
        {sub}
      </text>
    ) : null}
  </g>
);

const Label = ({ x, y, children, anchor = "start" }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end" }) => (
  <text x={x} y={y} textAnchor={anchor} className="dg-label">
    {children}
  </text>
);

const Line = ({ d, dashed }: { d: string; dashed?: boolean }) => (
  <path d={d} className={dashed ? "dg-line dg-line--dashed" : "dg-line"} markerEnd="url(#dg-arrow)" />
);

const Frame = ({ title, viewBox, children }: { title: string; viewBox: string; children: ReactNode }) => (
  <svg className="dg" viewBox={viewBox} role="img" aria-label={title}>
    <title>{title}</title>
    <defs>
      <marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" className="dg-arrowhead" />
      </marker>
    </defs>
    {children}
  </svg>
);

function Architecture() {
  const core = [
    { y: 60, title: "identity", sub: "users, factors, tokens" },
    { y: 116, title: "vault + workflow", sub: "secrets, rules, leases" },
    { y: 172, title: "audit", sub: "hash chain" },
    { y: 228, title: "notify", sub: "in-app inbox" },
    { y: 284, title: "connector", sub: "heartbeat, rotation" },
    { y: 340, title: "Ory Kratos · Hydra · Polis", sub: "passwords, OAuth, SAML" },
  ];
  return (
    <Frame title="Sneakers-PAM architecture and trust boundaries" viewBox="0 0 960 520">
      <Label x={20} y={36}>Clients</Label>
      <Box x={20} y={70} w={150} h={50} title="People" sub="browser, phone" tone="ext" />
      <Box x={20} y={170} w={150} h={50} title="Agents" sub="MCP clients" tone="ext" />
      <Box x={20} y={270} w={150} h={50} title="CLIs" sub="sneakers-run, -put" tone="ext" />

      <Box x={205} y={150} w={120} h={90} title="Edge" sub="TLS on 443" tone="edge" />
      <Line d="M170,95 C190,95 190,175 205,175" />
      <Line d="M170,195 H205" />
      <Line d="M170,295 C190,295 190,215 205,215" />
      <Label x={265} y={262} anchor="middle">HTTPS</Label>

      <rect x={355} y={20} width={420} height={480} rx={12} className="dg-boundary" />
      <Label x={370} y={42}>Cluster (k0s or yours) · NetworkPolicy per edge</Label>

      <Box x={375} y={64} w={125} h={48} title="web" sub="staff, admin apps" tone="edge" />
      <Box x={375} y={154} w={125} h={48} title="gateway" sub="sessions, CSRF, MFA" tone="edge" />
      <Box x={375} y={244} w={125} h={48} title="mcp" sub="token check" tone="edge" />
      <Box x={375} y={334} w={125} h={48} title="sshbroker" sub="brokered SSH" tone="edge" />
      <Line d="M325,170 C350,170 350,88 375,88" />
      <Line d="M325,185 H375" />
      <Line d="M325,205 C350,205 350,268 375,268" />
      <Line d="M325,225 C350,225 350,358 375,358" />
      <Line d="M437,112 V154" />
      <Line d="M437,244 V202" />

      <path d="M522,84 V364" className="dg-bus" />
      <path d="M500,178 H522" className="dg-bus" />
      {core.map((c) => (
        <g key={c.title}>
          <Line d={`M522,${c.y + 24} H545`} />
          <Box x={545} y={c.y} w={210} h={48} title={c.title} sub={c.sub} tone="core" />
        </g>
      ))}
      <Label x={503} y={196}>gRPC</Label>

      <Box x={375} y={430} w={180} h={50} title="PostgreSQL" sub="a database per service" tone="data" />
      <Box x={575} y={430} w={180} h={50} title="Valkey" sub="sessions, inbox, tickets" tone="data" />
      <Line d="M650,388 V430" />
      <Line d="M465,382 V430" dashed />

      <Label x={800} y={36}>Targets</Label>
      <Box x={800} y={284} w={145} h={48} title="Directory" sub="LDAP/LDAPS, Kerberos" tone="ext" />
      <Box x={800} y={398} w={145} h={48} title="SSH hosts" sub="pinned host keys" tone="ext" />
      <Line d="M755,308 H800" />
      <Line d="M500,358 H512 V412 H800" />
    </Frame>
  );
}

function ApplianceHld() {
  return (
    <Frame title="Appliance high-level design" viewBox="0 0 960 560">
      <Box x={20} y={20} w={640} h={70} title="Sneakers product bundle" sub="edge on 443 · gateway · web · mcp · services · PostgreSQL · Valkey · Ory" tone="core" />
      <Box x={20} y={110} w={640} h={60} title="k0s, single node" sub="containerd and kubelet; data on the encrypted state volume" tone="edge" />
      <rect x={20} y={190} width={640} height={150} rx={10} className="dg-boundary" />
      <Label x={36} y={212}>Read-only OS: SquashFS root, dm-verity, two slots (A/B)</Label>
      <Box x={36} y={226} w={140} h={46} title="sneakers-init" sub="PID 1" tone="os" />
      <Box x={190} y={226} w={140} h={46} title="accessd" sub="access, keys, audit" tone="os" />
      <Box x={344} y={226} w={140} h={46} title="osadmin" sub=":8443, unprivileged" tone="os" />
      <Box x={498} y={226} w={146} h={46} title="sshd" sub=":22, certificate only" tone="os" />
      <Box x={36} y={284} w={140} h={42} title="netd" sub="network, nftables" tone="os" />
      <Box x={190} y={284} w={140} h={42} title="console" sub="first-boot screens" tone="os" />
      <Box x={344} y={284} w={140} h={42} title="edgefall" sub="box-state page" tone="os" />
      <Box x={498} y={284} w={146} h={42} title="firstboot" sub="setup steps" tone="os" />
      <Box x={20} y={360} w={640} h={60} title="Signed boot" sub="UEFI Secure Boot → systemd-boot → signed UKI (kernel, initrd, lockdown=integrity)" tone="key" />
      <Box x={20} y={440} w={310} h={60} title="Firmware and hardware" sub="UEFI with project keys · x86-64 VM or server" tone="ext" />
      <Box x={350} y={440} w={310} h={60} title="TPM 2.0" sub="seals the disk key to PCR 7 + 11" tone="key" />

      <Label x={700} y={36}>Network</Label>
      <Box x={700} y={50} w={240} h={56} title="Service interface" sub="443 and 80 for the product" tone="edge" />
      <Box x={700} y={122} w={240} h={56} title="Management interface" sub="22 and 8443 only, allow-list" tone="warn" />
      <Line d="M700,78 H660" />
      <Line d="M700,150 H680 V249 H644" />

      <Label x={700} y={222}>Disk</Label>
      <Box x={700} y={236} w={240} h={40} title="ESP" sub="systemd-boot, signed UKIs, key files" tone="key" />
      <Box x={700} y={284} w={116} h={40} title="root A" sub="verity" tone="os" />
      <Box x={824} y={284} w={116} h={40} title="root B" sub="next update" tone="os" />
      <Box x={700} y={332} w={240} h={40} title="state: LUKS2 AES-XTS" sub="/var/lib" tone="data" />
      <Box x={700} y={380} w={240} h={40} title="backup: LUKS2 AES-XTS" sub="reserved, unused yet" tone="data" />
      <Box x={700} y={428} w={240} h={40} title="key file (no TPM only)" tone="warn" />
      <Label x={700} y={494}>The owner’s escrow (age, to 1-3</Label>
      <Label x={700} y={510}>SSH recovery keys) holds the disk</Label>
      <Label x={700} y={526}>key and the product’s keys.</Label>
    </Frame>
  );
}

function ApplianceBoot() {
  const steps = [
    { x: 20, title: "UEFI firmware", sub: "PK, KEK, db: project keys" },
    { x: 210, title: "systemd-boot", sub: "signed, no shim" },
    { x: 400, title: "UKI", sub: "kernel + initrd + cmdline" },
    { x: 590, title: "dm-verity root", sub: "hash inside the UKI" },
    { x: 780, title: "sneakers-init", sub: "picks the boot phase" },
  ];
  return (
    <Frame title="Appliance low-level design: boot chain and keys" viewBox="0 0 960 420">
      <Label x={20} y={30}>Boot chain: each stage verifies the next</Label>
      {steps.map((s, i) => (
        <g key={s.title}>
          <Box x={s.x} y={44} w={160} h={56} title={s.title} sub={s.sub} tone="key" />
          {i < steps.length - 1 ? <Line d={`M${s.x + 160},72 H${s.x + 190}`} /> : null}
        </g>
      ))}
      <Label x={20} y={130}>Measured into PCR 7 (Secure Boot state) and PCR 11 (the UKI)</Label>

      <Box x={20} y={160} w={200} h={60} title="TPM 2.0" sub="policy: PCR 7 + 11" tone="key" />
      <Box x={280} y={160} w={200} h={60} title="Disk key" sub="random 256-bit" tone="key" />
      <Box x={540} y={160} w={190} h={60} title="LUKS2 state + backup" sub="AES-XTS, nosuid, nodev" tone="data" />
      <Box x={780} y={160} w={160} h={60} title="Sealed items" sub="AES-256-GCM, HKDF" tone="data" />
      <Line d="M220,190 H280" />
      <Line d="M480,190 H540" />
      <Line d="M730,190 H780" />
      <Label x={250} y={182} anchor="middle">unseals</Label>

      <Box x={780} y={260} w={160} h={60} title="Product keys" sub="vault root key, TOTP key" tone="core" />
      <Line d="M860,220 V260" />
      <Box x={540} y={260} w={190} h={60} title="Escrow file" sub="age to 1-3 SSH recovery keys" tone="warn" />
      <Line d="M780,290 H730" />
      <Line d="M380,220 V290 H540" dashed />

      <Box x={20} y={260} w={200} h={60} title="No TPM, or arm64" sub="key-file partition" tone="warn" />
      <Line d="M120,260 V220" dashed />
      <Label x={20} y={350}>Reduced protection is labelled on the console and the :8443 Status page.</Label>
      <Label x={20} y={370}>An update predicts the next UKI’s PCR 11 and seals a new copy of the disk key before it switches slots.</Label>
      <Label x={20} y={390}>Set to Secure Boot but the firmware stops enforcing it: the box shows the mismatch screen and starts nothing.</Label>
    </Frame>
  );
}

function ApplianceDisk() {
  const parts = [
    { w: 90, title: "1 ESP", sub: "1 GiB FAT32", tone: "key" as Tone },
    { w: 140, title: "2 root A", sub: "8 GiB verity", tone: "os" as Tone },
    { w: 140, title: "3 root B", sub: "8 GiB, next", tone: "os" as Tone },
    { w: 70, title: "4 key", sub: "16 MiB", tone: "warn" as Tone },
    { w: 270, title: "5 state (LUKS2)", sub: "the rest · /var/lib", tone: "data" as Tone },
    { w: 190, title: "6 backup (LUKS2)", sub: "30%, min 16 GiB", tone: "data" as Tone },
  ];
  let x = 20;
  const placed = parts.map((p) => {
    const at = { ...p, x };
    x += p.w + 4;
    return at;
  });
  return (
    <Frame title="Appliance low-level design: disk layout and updates" viewBox="0 0 960 330">
      <Label x={20} y={30}>GPT disk, 64 GiB minimum. Partitions 1 to 3 are written by the build; first boot makes 4 to 6.</Label>
      {placed.map((p) => (
        <Box key={p.title} x={p.x} y={44} w={p.w} h={60} title={p.title} sub={p.sub} tone={p.tone} />
      ))}
      <Label x={20} y={136}>Update to the inactive slot</Label>
      <Box x={20} y={150} w={170} h={60} title="Signed .bin" sub="header + cosign sig" tone="key" />
      <Box x={220} y={150} w={170} h={60} title="Verify" sub="key, channel, size, SHA-256" tone="key" />
      <Box x={420} y={150} w={170} h={60} title="Refuse downgrade" sub="not newer: refused" tone="warn" />
      <Box x={620} y={150} w={150} h={60} title="Decrypt (age)" sub="write root B" tone="os" />
      <Box x={800} y={150} w={140} h={60} title="Reseal + boot" sub="counted entry" tone="os" />
      <Line d="M190,180 H220" />
      <Line d="M390,180 H420" />
      <Line d="M590,180 H620" />
      <Line d="M770,180 H800" />
      <Box x={620} y={250} w={320} h={56} title="Three failed boots" sub="systemd-boot falls back to the previous slot" tone="warn" />
      <Line d="M870,210 V250" />
      <Label x={20} y={270}>Logs: init and services write to tmpfs (1 MiB), never disk.</Label>
      <Label x={20} y={290}>Pod logs, the OS audit log and images are capped on the state volume.</Label>
      <Label x={20} y={310}>The backup volume is encrypted and reserved; no backup job writes to it yet.</Label>
    </Frame>
  );
}

function ApplianceRuntime() {
  return (
    <Frame title="Appliance low-level design: OS processes and privileges" viewBox="0 0 960 420">
      <Box x={360} y={20} w={240} h={56} title="sneakers-init (PID 1)" sub="service table, init.sock, OS audit" tone="os" />
      <Box x={20} y={130} w={200} h={64} title="accessd (root)" sub="sessions, roles, step-up, keys" tone="key" />
      <Box x={260} y={130} w={200} h={64} title="osadmin (osadmin)" sub="HTTPS :8443, static pages, Connect API" tone="os" />
      <Box x={500} y={130} w={200} h={64} title="sshd" sub=":22, box-issued certs, then TOTP" tone="os" />
      <Box x={740} y={130} w={200} h={64} title="netd" sub="addresses, routes, nftables" tone="os" />
      <Line d="M480,76 V100 H120 V130" />
      <Line d="M480,100 H360 V130" />
      <Line d="M480,100 H600 V130" />
      <Line d="M480,100 H840 V130" />
      <Line d="M260,162 H220" />
      <Line d="M500,180 H480 V210 H120 V194" dashed />
      <Label x={290} y={206}>sshd: TOTP and root challenge via accessd</Label>

      <Box x={20} y={260} w={200} h={56} title="Root shell" sub="one-time challenge + code" tone="warn" />
      <Line d="M120,260 V194" dashed />
      <Box x={260} y={260} w={200} h={56} title="OS audit log" sub="daily JSONL, SHA-256 chain" tone="data" />
      <Box x={500} y={260} w={200} h={56} title="k0s (root)" sub="after setup and a bundle" tone="edge" />
      <Box x={740} y={260} w={200} h={56} title="Firewall" sub="22 + 8443 on management only" tone="warn" />
      <Line d="M840,194 V260" />
      <Line d="M170,194 C170,230 300,230 330,260" />
      <Label x={20} y={350}>osadmin runs unprivileged, can’t reach init.sock, and forwards every :8443 call to accessd, which checks</Label>
      <Label x={20} y={370}>it against the method’s rule (least role, step-up, audit action). A method without a rule is refused.</Label>
      <Label x={20} y={390}>No login reaches uid 0 directly: the root shell runs under accessd, owner only, audited.</Label>
    </Frame>
  );
}

const diagrams: Record<DiagramId, () => ReactNode> = {
  architecture: Architecture,
  "appliance-hld": ApplianceHld,
  "appliance-boot": ApplianceBoot,
  "appliance-disk": ApplianceDisk,
  "appliance-runtime": ApplianceRuntime,
};

export const Diagram = ({ id, caption }: { id: DiagramId; caption: string }) => {
  const Figure = diagrams[id];
  return (
    <figure className="dg-figure">
      <Figure />
      <figcaption>{caption}</figcaption>
    </figure>
  );
};
