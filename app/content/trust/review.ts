/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// The long form behind the security review PDF. The controls tables at the
// end of each section come from controls.ts, so a claim lives in one place.
import type { ReviewSection } from "./types.ts";

export const review = {
  title: "Sneakers-PAM Security Review",
  subtitle: "Architecture, key custody and controls of a self-hosted privileged access vault, with the evidence behind each claim.",
  docVersion: "Draft 1",
  date: "29 October 2026",
  productVersion: "v0.1.0-rc.4 (prerelease)",
  classification: "Public",
  disclaimer:
    "Sneakers-PAM holds no SOC 2 report, ISO 27001 certificate or other certification. This review describes only what is built and published, maps it to SOC 2 Trust Services Criteria, ISO/IEC 27001:2022 Annex A, NIST SP 800-63B and OWASP ASVS 4.0.3 so an independent reviewer can test it, and lists every known gap. Where a control depends on how you deploy Sneakers, it says so.",
  gapsIntro:
    "Every control that is partial or planned, with the open issue that tracks it. Nothing here is promised for a date; each issue carries its own milestone.",
  crosswalkIntro:
    "Each control against the framework references it supports. A reference means the control contributes evidence toward that criterion, not that the criterion is fully met. SP 800-63B references use Revision 3 section numbers.",
  sections: [
    {
      id: "scope",
      title: "1. Scope and how to read this review",
      blocks: [
        {
          kind: "p",
          text: "Sneakers-PAM is an open-source privileged access manager: a vault for privileged credentials, with check-out, approvals, rotation, brokered SSH, an MCP server for agents, and a hash-chained audit trail. You run it yourself, as a signed appliance or as Helm charts on your own Kubernetes. The project operates no hosted service and never receives your data.",
        },
        {
          kind: "p",
          text: "This review covers the v0.1.0 release train, currently at release candidate 4. Each control names the component tag it first ships in; the v0.1.0-rc.4 release builds every service from a pinned commit. A control marked shipped has its code on a published tag. Partial means it is built with a named gap. Planned means it isn't built.",
        },
        {
          kind: "table",
          head: ["Framework", "Version", "How it is used here"],
          rows: [
            ["SOC 2 Trust Services Criteria", "2017, revised points of focus 2022", "Common Criteria (CC), Availability (A) and Confidentiality (C) references per control"],
            ["ISO/IEC 27001 Annex A", "2022", "Annex A control references per control"],
            ["NIST SP 800-63B", "Revision 3 numbering", "Authenticator and session requirements for sign-in and step-up"],
            ["OWASP ASVS", "4.0.3", "Verification requirements for the web and API surface"],
          ],
        },
        {
          kind: "note",
          tone: "warn",
          text: "Sneakers-PAM is in prerelease. Several controls are partial, and two areas (encryption between services, and scheduled backups) are not built. They are described plainly in their sections and collected in Gaps and planned work.",
        },
      ],
    },
    {
      id: "architecture",
      title: "2. Architecture and data flows",
      areas: ["architecture"],
      blocks: [
        {
          kind: "p",
          text: "Sneakers is a set of small Go services, each with its own database in a shared PostgreSQL cluster, talking over gRPC. There is no message broker. Valkey (Redis-compatible) holds gateway sessions, the notification inbox and short-lived SSH tickets.",
        },
        {
          kind: "table",
          head: ["Component", "Role", "Holds"],
          rows: [
            ["gateway", "The only entry point. GraphQL for browser sessions and for tokens, sign-in, sessions, CSRF.", "Session records in Valkey"],
            ["identity", "Users, groups, second factors, service accounts and tokens.", "Encrypted TOTP seeds, hashed codes and tokens"],
            ["vault", "Secrets, folders and access rules, versions, break-glass, rotation schedules.", "Envelope-encrypted values, the key ring"],
            ["workflow", "Check-out leases and approvals.", "Lease and request state"],
            ["audit", "Append-only, hash-chained audit records.", "Metadata only, never values"],
            ["connector", "Heartbeat and rotation against targets over LDAP/LDAPS and Kerberos.", "Nothing at rest"],
            ["sshbroker", "In-browser SSH using a credential the user never sees.", "Single-use tickets, no key material"],
            ["notify", "In-app notification inbox.", "Action, subject and actor labels only"],
            ["mcp", "MCP server and CLIs for agents.", "Nothing; forwards the caller's own token"],
            ["web", "Staff and admin web apps, server-rendered.", "Nothing; the browser holds one HttpOnly cookie"],
            ["Ory Kratos, Hydra, Polis", "Passwords, OAuth for agents and CLIs, SAML sign-on.", "Password hashes, OAuth clients"],
          ],
        },
        {
          kind: "p",
          text: "Figure 1 is the high-level design of the product. The same services run on the appliance and on your own Kubernetes.",
        },
        {
          kind: "figure",
          diagram: "architecture",
          caption: "Figure 1. Architecture and trust boundaries. Every internal call is gRPC carrying a verified workload identity. Solid arrows are calls; the dashed arrow is the front tier's use of the database and Valkey.",
        },
        {
          kind: "p",
          text: "Trust boundaries: browsers and agents reach only the gateway, the MCP server, the web apps and the SSH broker's WebSocket. Every internal call carries a verified workload identity and is limited by a per-method caller allow-list and a NetworkPolicy. Only the connector and the SSH broker reach target systems.",
        },
        {
          kind: "flow",
          title: "Sign in",
          steps: [
            "The browser posts credentials to the web app, which calls the gateway server-side.",
            "Kratos checks the password; identity checks the second factor (TOTP, emailed code or passkey).",
            "The gateway stores the session in Valkey and returns an opaque, HttpOnly, SameSite=Strict cookie.",
            "Every later request carries the cookie and a CSRF token; a session without a verified factor gets mfa_required.",
          ],
        },
        {
          kind: "flow",
          title: "Reveal a value",
          steps: [
            "The gateway passes the user's identity and second-factor time to the vault.",
            "The vault refuses a retired secret, then checks the field, the folder rules, any approval and step-up.",
            "It unwraps the secret's data key, decrypts only the requested field and records secret.reveal in the audit chain.",
            "The value goes back through the gateway to the web app, masked until the user reveals it.",
          ],
        },
        {
          kind: "flow",
          title: "An agent uses a secret through MCP",
          steps: [
            "The agent calls the MCP server with its own OAuth, service-account or personal token.",
            "The MCP server checks the token (failing closed) and forwards it unchanged to the gateway's machine API.",
            "The vault applies the same rules. An approval-gated secret returns an approval link, not a value.",
            "A person approves in the browser with a second factor; the agent redeems the value once, within 60 seconds.",
          ],
        },
        {
          kind: "flow",
          title: "Check-out and rotation",
          steps: [
            "workflow checks access, the type and any existing lease, and issues one lease.",
            "On check-in by the holder, the vault queues a rotation.",
            "The connector pulls the job, changes the password on the target using the account's own current password, and reports back.",
            "The vault stores the new value as a new version; every step is audited.",
          ],
        },
      ],
    },
    {
      id: "crypto",
      title: "3. Key hierarchy, custody and encryption",
      areas: ["crypto"],
      blocks: [
        {
          kind: "p",
          text: "Every secret field is envelope-encrypted. The hierarchy has three tiers, and only the top one ever leaves the database.",
        },
        {
          kind: "table",
          head: ["Key", "Algorithm", "Where it lives", "Rotation"],
          rows: [
            ["Root key", "256-bit, AES-256-GCM key wrap", "Process memory, loaded from the environment. On the appliance, on the TPM-sealed state volume and in the owner's escrow.", "Not rotatable today"],
            ["Working keys (kek-v1, kek-v2, ...)", "256-bit, AES-256-GCM key wrap", "Wrapped by the root key in the vault database; one active", "Every 90 days by default, or on demand by a site admin"],
            ["Data key, one per secret", "256-bit, AES-256-GCM, 96-bit random nonce per field, field name as AAD", "Wrapped by a working key, stored with each record and version", "Re-wrapped on working-key rotation"],
            ["TOTP seed key", "AES-256-GCM", "identity service environment; appliance escrow", "Not rotatable without re-enrolment"],
            ["Appliance disk key", "LUKS2, AES-XTS, 256-bit", "Sealed in the TPM to PCR 7 and 11; key-file fallback without a TPM", "Resealed on each update"],
          ],
        },
        {
          kind: "p",
          text: "Rotating a working key re-wraps each data key and never decrypts a value. The job is idempotent and resumable, and retired keys stay available for decryption only. At start-up the root key must unwrap every working key before any migration runs, so a wrong key stops the vault with the schema untouched.",
        },
        {
          kind: "note",
          tone: "warn",
          text: "Traffic between services is authenticated but not encrypted: gRPC clients dial without TLS and the gateway serves plain HTTP behind the ingress. On your own Kubernetes, run Sneakers on a private network or behind a service mesh with mTLS. Metadata (names, folders, rules) is stored unencrypted in the database; on the appliance it is protected by full-disk encryption.",
        },
      ],
    },
    {
      id: "identity",
      title: "4. Identity, MFA, SSO and sessions",
      areas: ["identity"],
      blocks: [
        {
          kind: "p",
          text: "Passwords are held by Ory Kratos and never touch a Sneakers service. Every session needs a second factor: TOTP, an emailed code or a passkey. Sensitive actions (changing factors, approving, consenting to an agent, revealing where policy requires, sensitive check-outs) need a factor verified within MFA_MAX_AGE, 30 minutes by default and 4 hours at most.",
        },
        {
          kind: "p",
          text: "The browser holds an opaque session id only. The cookie is HttpOnly, SameSite=Strict and Secure by default; sessions slide on use within an admin-set lifetime of 15 to 60 minutes, and an admin cutoff ends every session issued before it. CSRF uses a 32-byte double-submit token compared in constant time, and CORS is an exact-origin allow-list.",
        },
        {
          kind: "note",
          tone: "warn",
          text: "Against SP 800-63B: TOTP codes aren't yet refused on reuse within their period (5.1.4.2), and emailed codes don't prove possession of a device, so they don't count as an out-of-band authenticator (5.1.3.1). Passkeys work as a second factor; passwordless passkey sign-in isn't built.",
        },
      ],
    },
    {
      id: "authorization",
      title: "5. Authorization, approvals and break-glass",
      areas: ["authorization"],
      blocks: [
        {
          kind: "p",
          text: "Access is decided in the vault from rules on a folder tree, evaluated most specific first, with deny as the default. A rule grants read, informed, approve or manage independently. Owners get read, approve and manage on their own secrets.",
        },
        {
          kind: "table",
          head: ["Approval level", "An owner", "Someone with read access", "Someone without read access"],
          rows: [
            ["Normal", "No approval", "No approval", "Refused"],
            ["Approval required", "No approval", "Any one owner approves", "Refused"],
            ["Always approve", "Another owner or an approver decides", "An owner or approver decides", "Refused"],
          ],
        },
        {
          kind: "p",
          text: "Nobody approves their own request. On an install where nobody else can decide, the requester confirms once with a fresh second factor, and that confirmation is recorded; it is not two-person control. Break-glass is for site admins from their own web session with a TOTP code, lasts 15 minutes, and is refused if its audit record can't be written.",
        },
      ],
    },
    {
      id: "access",
      title: "6. Reveal, check-out and rotation",
      areas: ["access"],
      blocks: [
        {
          kind: "p",
          text: "A value leaves the vault in four ways: a person reveals one field; an approved use is redeemed once; a check-out lease hands over a credential that rotates on check-in; or the SSH broker uses a key on the user's behalf without showing it. Each one is audited.",
        },
        {
          kind: "p",
          text: "Rotation runs on a schedule or on demand through the connector, which installs nothing on targets and rotates an account using its own current password. LDAP/LDAPS and Kerberos rotation are built; SSH, WinRM and Windows-local rotation are not.",
        },
      ],
    },
    {
      id: "audit",
      title: "7. Tamper-evident audit trail",
      areas: ["audit"],
      blocks: [
        {
          kind: "p",
          text: "Every reveal, check-out, approval, break-glass and admin action is written to the audit service as a record whose SHA-256 hash covers its fields and the previous record's hash. VerifyChain walks the whole chain and reports the first gap, broken link or wrong hash. Records carry which field was revealed, never the value.",
        },
        {
          kind: "note",
          tone: "warn",
          text: "The chain detects edits by anyone without database write access. It is keyless and unsigned and the table doesn't block UPDATE or DELETE, so someone with database write access could rewrite it consistently. Routine audit writes are best-effort; only break-glass fails closed. A signed, encrypted archive for offline keeping is planned.",
        },
      ],
    },
    {
      id: "machine",
      title: "8. MCP server and machine API",
      areas: ["machine"],
      blocks: [
        {
          kind: "p",
          text: "Agents get no shortcuts. The MCP server holds no credentials and makes no access decisions: it checks the caller's token, fails closed when it can't, and forwards that token to the gateway's machine API, where the vault applies the same rules, approvals and audit as for a person. Agents and tokens can never use break-glass and can never decide an approval.",
        },
        {
          kind: "p",
          text: "An agent with access does receive plaintext values; that is the point of giving it access. Approval-gated secrets return a link for a person to approve, super-sensitive fields are withheld from every token unless an admin allows it, and the MCP add-on is off by default.",
        },
      ],
    },
    {
      id: "appliance",
      title: "9. Appliance: Secure Boot, TPM and signed updates",
      areas: ["appliance"],
      blocks: [
        {
          kind: "p",
          text: "The appliance is a single-node Kubernetes box built from a declared file list rather than a Linux distribution. Its root is a read-only, dm-verity-checked SquashFS whose hash is inside a signed kernel image, booted under Secure Boot with project-owned keys and no shim.",
        },
        {
          kind: "figure",
          diagram: "appliance-hld",
          caption: "Figure 2. Appliance high-level design: the layers from firmware to product, the two network interfaces and the disk.",
        },
        {
          kind: "figure",
          diagram: "appliance-boot",
          caption: "Figure 3. Appliance low-level design: the verified boot chain, the TPM-sealed disk key and what the escrow carries.",
        },
        {
          kind: "figure",
          diagram: "appliance-disk",
          caption: "Figure 4. Appliance low-level design: the GPT layout and the A/B update path.",
        },
        {
          kind: "figure",
          diagram: "appliance-runtime",
          caption: "Figure 5. Appliance low-level design: OS processes, the users they run as, and where every privileged action is checked.",
        },
        {
          kind: "flow",
          title: "Boot chain",
          steps: [
            "UEFI firmware, enrolled with the project's own PK, KEK and db keys, verifies the signed systemd-boot.",
            "systemd-boot verifies one signed UKI holding the kernel, initrd and command line (lockdown=integrity).",
            "Early boot unseals the disk key from the TPM against PCR 7 and 11 and opens the LUKS2 state volume.",
            "dm-verity checks every block of the read-only root against the hash in the signed UKI; a changed block halts the box.",
          ],
        },
        {
          kind: "flow",
          title: "Update",
          steps: [
            "The box checks the update's cosign signature against the release key built into the running OS.",
            "It checks the channel (lab or production), size and SHA-256, and refuses anything not newer than what runs.",
            "It decrypts the payload, writes the inactive slot and seals a fresh disk-key copy to the new release's predicted PCR 11.",
            "It boots the new slot; three failed boots fall back to the previous release.",
          ],
        },
        {
          kind: "note",
          tone: "info",
          text: "Without a TPM (including arm64 and Raspberry Pi), or with Secure Boot turned off, the box runs in a labelled reduced-protection mode. SSH is certificate-only with a TOTP code, and the firewall opens only SSH and the admin page, only on the management interface.",
        },
      ],
    },
    {
      id: "supply-chain",
      title: "10. Supply chain and releases",
      areas: ["supply-chain"],
      blocks: [
        {
          kind: "p",
          text: "Releases are built only from a tag the maintainer creates. Production signing keys are released to CI only for version tags, after the maintainer's approval. Every release asset is signed with cosign, and service images are published for linux/amd64 and linux/arm64.",
        },
        {
          kind: "list",
          items: [
            "Verify a download: sha256sum -c SHA256SUMS, then cosign verify-blob --key with the published release key (see the appliance's release documentation).",
            "Signatures use a project-held key and aren't written to a public transparency log.",
            "No SBOM or SLSA provenance is published yet; the NIST SSDF self-assessment that will close this is tracked in sneakers-release#69, and a NIST SP 800-53 mapping in sneakers-release#70.",
          ],
        },
      ],
    },
    {
      id: "recovery",
      title: "11. Backups and recovery",
      areas: ["recovery"],
      blocks: [
        {
          kind: "p",
          text: "Recovery today rests on two things: the key escrow, which lets a replacement box open restored data, and sneakers-migrate, which exports every service's data as an age-encrypted archive and verifies the audit chain on import. Scheduled and offsite backups are not built.",
        },
        {
          kind: "note",
          tone: "warn",
          text: "Without a downloaded escrow, losing the TPM or the box loses the data. Download the escrow after the product is installed, and again after anything that changes its keys.",
        },
      ],
    },
    {
      id: "operations",
      title: "12. Logging, monitoring and health",
      areas: ["operations"],
      blocks: [
        {
          kind: "p",
          text: "Each service reports readiness from its real dependencies and keeps liveness to the process. Logs are JSON in every cluster, at a level set per environment (error in production by default), and never include secrets, tokens or personal data. Traces and metrics can go to your OpenTelemetry collector.",
        },
      ],
    },
    {
      id: "development",
      title: "13. Secure development and vulnerability handling",
      areas: ["development"],
      blocks: [
        {
          kind: "p",
          text: "Every change lands through a pull request that passes build and test, gosec, govulncheck, licence checks and a scrub for secrets and identifying details. Tests specify behaviour through public APIs, against real Postgres, real sshd and network namespaces, and the appliance is booted end to end in QEMU with Secure Boot and a software TPM.",
        },
        {
          kind: "p",
          text: "Report vulnerabilities privately through GitHub's private vulnerability reporting on the affected repository. Fixes target the latest released minor version.",
        },
      ],
    },
  ] satisfies ReviewSection[],
};
