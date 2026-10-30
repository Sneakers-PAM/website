/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// The control register. Each entry states what is built, the component tag it
// first ships in, the files and tests that prove it, and the open issues that
// cover what is missing. A control is only "shipped" when its code is on a
// published tag; anything else says so.
import type { Area, Control } from "./types.ts";

export const areas: Area[] = [
  {
    id: "architecture",
    title: "Architecture and trust boundaries",
    summary: "Small services with one entry point, a database each, and an allow-list on every internal call.",
  },
  {
    id: "crypto",
    title: "Keys and encryption",
    summary: "Envelope encryption of every secret field, a rotating key ring, and what is and isn't encrypted on the wire.",
  },
  {
    id: "identity",
    title: "Identity, MFA and sessions",
    summary: "Sign-in, second factors, step-up and how a browser session is held.",
  },
  {
    id: "authorization",
    title: "Authorization and approvals",
    summary: "Folder rules that deny by default, approvals no one grants themselves, and break-glass.",
  },
  {
    id: "access",
    title: "Reveal, check-out and rotation",
    summary: "How a value leaves the vault, and how credentials are changed on their targets.",
  },
  {
    id: "audit",
    title: "Audit trail",
    summary: "A hash-chained record of every action, and its limits.",
  },
  {
    id: "machine",
    title: "MCP and machine API",
    summary: "How agents and tokens use secrets through the same rules a person does.",
  },
  {
    id: "appliance",
    title: "Appliance platform",
    summary: "A signed, read-only OS with Secure Boot, TPM-sealed disk keys and A/B updates.",
  },
  {
    id: "supply-chain",
    title: "Supply chain and releases",
    summary: "Signed artifacts, multi-arch images, protected release keys and what isn't there yet.",
  },
  {
    id: "recovery",
    title: "Backup and recovery",
    summary: "Key escrow and migration bundles exist; scheduled backups don't yet.",
  },
  {
    id: "operations",
    title: "Logging, monitoring and health",
    summary: "Readiness that follows real dependencies, log levels by environment, and telemetry.",
  },
  {
    id: "development",
    title: "Secure development and vulnerability handling",
    summary: "CI gates, scanning, public-code scrubbing and how to report a vulnerability.",
  },
];

export const controls: Control[] = [
  // Architecture and trust boundaries
  {
    id: "ARC-1",
    area: "architecture",
    title: "Single entry point for people and machines",
    statement:
      "Clients reach Sneakers only through the gateway (two GraphQL endpoints, one for browser sessions and one for tokens), the MCP bridge and the web apps. Backend services aren't exposed outside the cluster.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-gateway", path: "README.md", kind: "doc" },
      { repo: "sneakers-release", path: "charts/sneakers-lib/templates/_resources.tpl", kind: "code", detail: "per-service NetworkPolicy" },
    ],
    mappings: { soc2: ["CC6.1", "CC6.6"], iso27001: ["A.8.20", "A.8.22"], asvs: ["V1.4.1"] },
  },
  {
    id: "ARC-2",
    area: "architecture",
    title: "Workload identity on every internal call",
    statement:
      "Each service-to-service gRPC call carries the caller's projected Kubernetes ServiceAccount token. The callee checks issuer, audience, expiry and a per-method caller allow-list, and refuses to start without an issuer configured. Only the gateway may pass an end user's identity.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-vault", path: "internal/server/workloadauth.go", kind: "code" },
      { repo: "sneakers-vault", path: "internal/server/workloadauth_tokens_test.go", kind: "test", detail: "TestWorkloadAuthAcceptsAndRefusesTokens" },
      { repo: "sneakers-audit", path: "internal/grpcsvc/callers_test.go", kind: "test", detail: "TestCallerAuth_UnlistedPodIsRefusedEvenWithAValidToken" },
      { repo: "sneakers-gateway", path: "cmd/gateway/backend_test.go", kind: "test", detail: "TestBackendDialOptionsSendTheWorkloadTokenOnEveryCall" },
    ],
    mappings: { soc2: ["CC6.1", "CC6.3"], iso27001: ["A.5.15", "A.8.5"], asvs: ["V1.4.4", "V4.1.3"] },
    gaps: [{ repo: "sneakers-gateway", number: 27, title: "Workload identity for machine-API callers" }],
  },
  {
    id: "ARC-3",
    area: "architecture",
    title: "Network policy per call-graph edge",
    statement:
      "The Helm charts install a NetworkPolicy for each service that admits only its declared callers, plus policies for the bundled identity provider and database. The install test checks that blocked pods are blocked. Outbound traffic isn't restricted by default.",
    status: "partial",
    since: "v0.1.0-rc.3",
    evidence: [
      { repo: "sneakers-release", path: "charts/sneakers-lib/templates/_resources.tpl", kind: "code" },
      { repo: "sneakers-release", path: ".github/workflows/install-test.yml", kind: "ci" },
    ],
    mappings: { soc2: ["CC6.6"], iso27001: ["A.8.20", "A.8.22"] },
  },
  {
    id: "ARC-4",
    area: "architecture",
    title: "Hardened containers",
    statement:
      "Every service runs as non-root with a read-only root filesystem, no privilege escalation, all capabilities dropped and a seccomp profile. Each chart's values schema rejects an install that turns these off.",
    status: "shipped",
    since: "v0.1.0-rc.3",
    evidence: [{ repo: "sneakers-release", path: "charts/sneakers-lib/templates/_pod.tpl", kind: "code" }],
    mappings: { soc2: ["CC6.8"], iso27001: ["A.8.9"], asvs: ["V14.1.1"] },
  },

  // Keys and encryption
  {
    id: "CRY-1",
    area: "crypto",
    title: "Envelope encryption of every secret field",
    statement:
      "Each secret has its own 256-bit data key from the OS CSPRNG. Every field value is sealed with AES-256-GCM under a fresh 96-bit random nonce, with the field name bound as associated data, so a value can't be moved to another field undetected.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-vault", path: "internal/vault/crypto/envelope.go", kind: "code" },
      { repo: "sneakers-vault", path: "internal/vault/crypto/envelope_test.go", kind: "test", detail: "TestSealStoresNoPlaintext, TestTamperedCiphertextFailsAuth, TestWrongKEKCannotOpen" },
    ],
    mappings: { soc2: ["CC6.1", "C1.1"], iso27001: ["A.8.24"], asvs: ["V6.2.2", "V6.3.1"] },
  },
  {
    id: "CRY-2",
    area: "crypto",
    title: "Three-tier key hierarchy with a rotating key ring",
    statement:
      "A root key wraps versioned working keys, which wrap each secret's data key. Working keys rotate by re-wrapping data keys only, without decrypting any value; rotation is resumable, retired keys stay decrypt-only, and a scheduler rotates every 90 days by default. Only a site admin can rotate on demand.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-vault", path: "docs/kek-keyring.md", kind: "doc" },
      { repo: "sneakers-vault", path: "internal/vault/grpcsvc/kek_rotate_test.go", kind: "test", detail: "TestRotateKek_SiteAdmin_RewrapsEveryRecordAndAudits, TestRotateKek_NonAdmin_Denied" },
      { repo: "sneakers-vault", path: "internal/vault/grpcsvc/kek_schedule_test.go", kind: "test", detail: "TestKekSchedulerTick_RotatesWhenDue" },
    ],
    mappings: { soc2: ["CC6.1"], iso27001: ["A.8.24"], asvs: ["V6.4.1", "V6.4.2"] },
    gaps: [{ repo: "sneakers-vault", number: 104, title: "Key ring design note" }],
  },
  {
    id: "CRY-3",
    area: "crypto",
    title: "Fail-closed key start-up",
    statement:
      "Outside development the vault won't start without a root key, and the root key must unwrap every working key before any database migration runs. An unknown key reference fails closed.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-vault", path: "cmd/vault/boot.go", kind: "code" },
      { repo: "sneakers-vault", path: "cmd/vault/boot_test.go", kind: "test", detail: "TestMigrateAfterPreflight_CorrectKEK_MigratesAndBoots" },
      { repo: "sneakers-vault", path: "internal/vault/crypto/keyring_test.go", kind: "test", detail: "TestKeyringKEK_UnknownRef_FailsClosed" },
    ],
    mappings: { soc2: ["CC6.1"], iso27001: ["A.8.24"], asvs: ["V6.2.1"] },
  },
  {
    id: "CRY-4",
    area: "crypto",
    title: "Root key custody",
    statement:
      "The vault reads its root key from the environment at start and holds it in memory. On the appliance the key lives on the encrypted state volume, whose key is sealed in the TPM, and is copied into the owner's escrow. The root key itself can't be rotated, and there is no HSM or cloud KMS provider yet.",
    status: "partial",
    since: "v0.1.0-rc.3",
    evidence: [
      { repo: "sneakers-appliance", path: "docs/key-custody.md", kind: "doc", detail: "Product keys" },
      { repo: "sneakers-vault", path: "cmd/vault/main.go", kind: "code" },
    ],
    mappings: { soc2: ["CC6.1"], iso27001: ["A.8.24"], asvs: ["V6.4.1"] },
    gaps: [{ repo: "sneakers-vault", number: 41, title: "HSM and cloud KMS key providers" }],
  },
  {
    id: "CRY-5",
    area: "crypto",
    title: "Second-factor secrets and tokens at rest",
    statement:
      "TOTP seeds are sealed with AES-256-GCM under a dedicated key. Email codes and API tokens are stored only as SHA-256 hashes. The TOTP key can't be rotated yet without re-enrolling every factor.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-identity", path: "internal/secrets/secrets.go", kind: "code" },
      { repo: "sneakers-identity", path: "internal/secrets/secrets_test.go", kind: "test", detail: "TestOpenTamperFails, TestOpenWrongKeyFails" },
    ],
    mappings: { soc2: ["CC6.1"], iso27001: ["A.5.17", "A.8.24"], asvs: ["V2.9.1", "V6.1.1"] },
  },
  {
    id: "CRY-6",
    area: "crypto",
    title: "Metadata at rest",
    statement:
      "Only field values are application-encrypted. Secret names, folders, rules, targets and settings are stored as plain JSON in each service's database. On the appliance that database sits on the LUKS2-encrypted state volume; on your own Kubernetes, disk encryption is yours to provide.",
    status: "partial",
    since: "v0.1.0-rc.1",
    evidence: [{ repo: "sneakers-vault", path: "migrations/vault/0001_baseline.up.sql", kind: "code" }],
    mappings: { soc2: ["C1.1"], iso27001: ["A.8.24"] },
  },
  {
    id: "CRY-7",
    area: "crypto",
    title: "Encryption in transit between services",
    statement:
      "Internal gRPC calls are authenticated (ARC-2) but not encrypted: every client dials without TLS, and the gateway serves plain HTTP behind the cluster ingress. Confidentiality on the wire depends on the platform today (a private network or a service mesh with mTLS).",
    status: "planned",
    evidence: [
      { repo: "sneakers-gateway", path: "cmd/gateway/backend.go", kind: "code" },
      { repo: "sneakers-gateway", path: "README.md", kind: "doc", detail: "Before production" },
    ],
    mappings: { soc2: ["CC6.7"], iso27001: ["A.8.24", "A.8.20"], asvs: ["V9.2.2"] },
    gaps: [
      { repo: "sneakers-appliance", number: 235, title: "TLS on the product endpoint and cert-manager" },
      { repo: "sneakers-notify", number: 20, title: "TLS in REDIS_URL is ignored" },
    ],
  },
  {
    id: "CRY-8",
    area: "crypto",
    title: "Export-compliant, standard cryptography",
    statement:
      "Sneakers uses only standard, published algorithms from the Go standard library and well-known libraries (AES-GCM, AES-XTS through LUKS2, SHA-256, HKDF, ECDSA, age). There is no FIPS 140-3 validated mode yet.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [{ repo: "docs", path: "CRYPTO.md", kind: "doc" }],
    mappings: { iso27001: ["A.8.24", "A.5.31"], asvs: ["V6.2.2"] },
    gaps: [{ repo: "sneakers-appliance", number: 216, title: "FIPS 140-3 mode" }],
  },

  // Identity, MFA and sessions
  {
    id: "IDN-1",
    area: "identity",
    title: "Passwords held by a dedicated identity provider",
    statement:
      "Passwords are stored and checked by the bundled Ory Kratos, never by Sneakers services. Its hashing parameters are Kratos configuration and aren't asserted by this review. Self-service reset uses an emailed code and answers the same way whether or not the account exists.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-identity", path: "README.md", kind: "doc" },
      { repo: "sneakers-identity", path: "internal/grpcsvc/reset.go", kind: "code" },
    ],
    mappings: { soc2: ["CC6.1"], iso27001: ["A.5.17", "A.8.5"], nist80063b: ["5.1.1.2"], asvs: ["V2.4.1", "V2.5.2"] },
  },
  {
    id: "IDN-2",
    area: "identity",
    title: "Second factor required for every session",
    statement:
      "A session without a verified second factor gets mfa_required on the API. Factors are TOTP (RFC 6238), emailed six-digit codes (single use, five minutes, five guesses) and WebAuthn passkeys as a second factor with a strictly increasing sign counter.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-gateway", path: "internal/bff/http.go", kind: "code" },
      { repo: "sneakers-identity", path: "internal/grpcsvc/mfa.go", kind: "code" },
      { repo: "sneakers-identity", path: "internal/grpcsvc/mfa_pg_test.go", kind: "test", detail: "TestPGTotpVerifyAndReEnrollGuard" },
    ],
    mappings: { soc2: ["CC6.1"], iso27001: ["A.8.5"], nist80063b: ["4.2.1", "5.1.4", "5.1.8"], asvs: ["V2.7", "V2.8", "V4.3.1"] },
  },
  {
    id: "IDN-3",
    area: "identity",
    title: "TOTP replay and guessing limits",
    statement:
      "A pending second-factor sign-in ends after five wrong codes. TOTP verification itself doesn't yet refuse a code reused inside its period, and email codes don't prove possession of a device, so they don't meet SP 800-63B's out-of-band rules.",
    status: "partial",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-gateway", path: "internal/bff/mfa.go", kind: "code" },
      { repo: "sneakers-gateway", path: "internal/bff/stepup_test.go", kind: "test", detail: "TestMfaStepUp_AttemptBudgetEndsTheSession" },
    ],
    mappings: { nist80063b: ["5.1.4.2", "5.2.2", "5.1.3.1"], asvs: ["V2.2.1", "V2.8.4"] },
  },
  {
    id: "IDN-4",
    area: "identity",
    title: "Server-side sessions in a hardened cookie",
    statement:
      "The browser holds only an opaque session id in a cookie that is HttpOnly, SameSite=Strict and Secure by default; a malformed setting stops the gateway at start. Sessions slide on use within an admin-set lifetime of 15 to 60 minutes, and an admin cutoff ends every older session.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-gateway", path: "docs/cookies.md", kind: "doc" },
      { repo: "sneakers-gateway", path: "internal/bff/cookie_secure_test.go", kind: "test", detail: "TestEveryCookieHonoursSecure" },
      { repo: "sneakers-gateway", path: "internal/bff/session_cutoff_test.go", kind: "test", detail: "TestASessionIssuedBeforeTheCutoffIsEnded" },
    ],
    mappings: { soc2: ["CC6.1"], iso27001: ["A.8.5"], nist80063b: ["7.1", "4.2.3"], asvs: ["V3.2.1", "V3.3.1", "V3.4.1", "V3.4.2", "V3.4.3"] },
    gaps: [{ repo: "sneakers-gateway", number: 31, title: "Session tokens are stored unencrypted in Redis" }],
  },
  {
    id: "IDN-5",
    area: "identity",
    title: "Step-up for sensitive actions",
    statement:
      "Changing factors, approving requests, consenting to an agent's sign-in, revealing where policy requires it, and sensitive check-outs need a second factor verified within MFA_MAX_AGE (30 minutes by default, 4 hours at most).",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-gateway", path: "docs/configuration.md", kind: "doc", detail: "MFA_MAX_AGE" },
      { repo: "sneakers-gateway", path: "internal/bff/stepup_test.go", kind: "test", detail: "TestMfaStepUp_NeedsSessionAndCSRF" },
    ],
    mappings: { soc2: ["CC6.1"], iso27001: ["A.8.5"], nist80063b: ["7.2"], asvs: ["V3.7.1"] },
  },
  {
    id: "IDN-6",
    area: "identity",
    title: "CSRF and cross-origin protection",
    statement:
      "Every state-changing browser request carries a 32-byte CSRF token checked by double submit in constant time. CORS is an exact-origin allow-list; a wildcard or malformed entry stops the gateway at start.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-gateway", path: "internal/bff/csrf.go", kind: "code" },
      { repo: "sneakers-gateway", path: "cmd/gateway/cors_test.go", kind: "test", detail: "TestCORSBadEntriesRefused" },
    ],
    mappings: { iso27001: ["A.8.26"], asvs: ["V4.2.2", "V13.2.3", "V14.5.3"] },
  },
  {
    id: "IDN-7",
    area: "identity",
    title: "Browser security headers",
    statement:
      "The web apps send a nonce-based Content-Security-Policy with frame-ancestors 'none', plus nosniff, X-Frame-Options DENY and a same-origin referrer policy. Styles still allow 'unsafe-inline'.",
    status: "shipped",
    since: "v0.1.0-rc.2",
    evidence: [
      { repo: "sneakers-web", path: "packages/shell/src/server/csp.server.ts", kind: "code" },
      { repo: "sneakers-web", path: "packages/shell/src/server/csp.server.test.ts", kind: "test" },
    ],
    mappings: { iso27001: ["A.8.26"], asvs: ["V14.4.3", "V14.4.4", "V14.4.7"] },
  },
  {
    id: "IDN-8",
    area: "identity",
    title: "Single sign-on and passkey sign-in",
    statement:
      "SAML sign-on runs through the bundled Ory Polis at the gateway. Passkeys work as a second factor, but passwordless passkey sign-in isn't built, and SSO sessions have an open subject-mismatch bug.",
    status: "partial",
    since: "v0.1.0-rc.1",
    evidence: [{ repo: "sneakers-gateway", path: "internal/bff/sso.go", kind: "code" }],
    mappings: { soc2: ["CC6.1"], iso27001: ["A.8.5"], nist80063b: ["5.1.8", "5.2.5"] },
    gaps: [
      { repo: "sneakers-identity", number: 22, title: "Passkey sign-in" },
      { repo: "sneakers-identity", number: 20, title: "SSO sessions fail with a subject mismatch" },
    ],
  },

  // Authorization and approvals
  {
    id: "AUZ-1",
    area: "authorization",
    title: "Deny-by-default folder rules",
    statement:
      "Access comes from rules on a folder tree, evaluated most specific first, first match wins, deny by default. Rules grant read, informed, approve and manage separately; approve and manage imply read, informed never does. Access decisions are made in the vault, not the gateway.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-vault", path: "internal/vault/authz/resolve.go", kind: "code" },
      { repo: "sneakers-vault", path: "internal/vault/authz/resolve_test.go", kind: "test", detail: "TestResolve_ReadableUserActs, TestResolve_InformedIndependentOfRead" },
    ],
    mappings: { soc2: ["CC6.1", "CC6.3"], iso27001: ["A.5.15", "A.5.18", "A.8.3"], asvs: ["V4.1.3", "V4.1.5"] },
  },
  {
    id: "AUZ-2",
    area: "authorization",
    title: "Approvals no one grants to themselves",
    statement:
      "A secret can require approval or always require it. A requester never approves their own request. Where nobody else can decide (a single-user install, or the only approver), the requester confirms once with a fresh second factor; that is a recorded self-confirmation, not two-person control.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-mcp", path: "docs/api.md", kind: "doc", detail: "Approvals" },
      { repo: "sneakers-vault", path: "internal/vault/grpcsvc/secret_use_test.go", kind: "test", detail: "TestSecretUseIsReleasedOnceAfterAnOwnerApproves" },
    ],
    mappings: { soc2: ["CC6.3"], iso27001: ["A.5.3", "A.8.2"], asvs: ["V4.1.3"] },
    gaps: [{ repo: "sneakers-gateway", number: 47, title: "Approval queue, renewal, force check-in and quorum" }],
  },
  {
    id: "AUZ-3",
    area: "authorization",
    title: "One task, one prompt",
    statement:
      "An agent run's requests share one approval page with one second factor. Each item is still decided in the vault and audited on its own, the requester can't decide (the machine API has no decide call), and the stated purpose is shown as untrusted text.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [{ repo: "sneakers-gateway", path: "internal/resolvers/batch_approval_test.go", kind: "test" }],
    mappings: { soc2: ["CC6.3"], iso27001: ["A.8.2"] },
  },
  {
    id: "AUZ-4",
    area: "authorization",
    title: "Break-glass for people only",
    statement:
      "Break-glass is open to site admins only, from their own web session with a TOTP code, and lasts 15 minutes. Agents and tokens are refused, refusals are audited, and a break-glass reveal is refused if its audit record can't be written.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-gateway", path: "internal/resolvers/break_glass_people_only_test.go", kind: "test", detail: "TestPlainBreakGlassSecretIsRefusedToAgentsAndTokens" },
      { repo: "sneakers-vault", path: "internal/vault/grpcsvc/breakglass_test.go", kind: "test", detail: "TestBreakGlassAuditFailClosedDeniesReveal" },
    ],
    mappings: { soc2: ["CC6.1", "CC6.3"], iso27001: ["A.8.2", "A.8.18"], asvs: ["V4.3.1"] },
    gaps: [
      { repo: "sneakers-vault", number: 70, title: "Dual control for break-glass" },
      { repo: "sneakers-vault", number: 72, title: "Break-glass rate limits and frequency alerts" },
      { repo: "sneakers-vault", number: 151, title: "Enforce people-only reveals in the service, not only by routing" },
    ],
  },
  {
    id: "AUZ-5",
    area: "authorization",
    title: "Recovery role for history",
    statement:
      "Listing a secret's history needs read access; revealing or restoring an earlier version needs the separate recovery role plus a fresh second factor. Site admin doesn't imply recovery.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [{ repo: "sneakers-vault", path: "internal/vault/grpcsvc/recovery_test.go", kind: "test", detail: "TestRevealingAPriorVersionNeedsRecoveryAndFreshMFA" }],
    mappings: { soc2: ["CC6.3"], iso27001: ["A.8.2", "A.8.3"] },
  },

  // Reveal, check-out and rotation
  {
    id: "ACC-1",
    area: "access",
    title: "Reveal one field, with checks in order",
    statement:
      "A reveal is refused for a retired secret, then checks the field is sensitive, read access, approval and step-up, and only then decrypts the one requested field and records secret.reveal. Step-up on reveal is a global setting with per-folder overrides that only site admins set.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-vault", path: "internal/vault/grpcsvc/secrets.go", kind: "code" },
      { repo: "sneakers-vault", path: "internal/vault/grpcsvc/sensitive_settings_test.go", kind: "test", detail: "TestRevealStepUpFollowsTheGlobalSettingAndFolderOverrides" },
    ],
    mappings: { soc2: ["CC6.1", "C1.1"], iso27001: ["A.8.3", "A.8.12"], asvs: ["V4.1.1", "V8.3.4"] },
  },
  {
    id: "ACC-2",
    area: "access",
    title: "Single-use, short-lived approved uses",
    statement:
      "A prepared use expires in 10 minutes; once approved it must be redeemed within one minute, by the same token, once. Access is checked again at redemption, and the audit record never carries the value. Standing pre-approvals are capped at 24 hours.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-vault", path: "internal/vault/grpcsvc/secret_use_test.go", kind: "test", detail: "TestSecretUseOnlyTheSameTokenRedeems, TestSecretUseRechecksAccessAtRedeem, TestSecretUseAuditNeverCarriesTheValue" },
      { repo: "sneakers-vault", path: "internal/vault/grpcsvc/secret_use_hardening_test.go", kind: "test", detail: "TestRedeemMustFollowApprovalWithinAMinute" },
    ],
    mappings: { soc2: ["CC6.1"], iso27001: ["A.8.3"], asvs: ["V4.1.3"] },
  },
  {
    id: "ACC-3",
    area: "access",
    title: "Check-out leases that rotate on check-in",
    statement:
      "Check-out needs read access, a type that allows it, a fresh second factor for sensitive types (on by default) and no lease already held. Only the holder can check in, and check-in rotates the credential. Concurrent check-outs issue one lease.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-vault", path: "internal/workflow/grpcsvc/checkout.go", kind: "code" },
      { repo: "sneakers-vault", path: "internal/workflow/grpcsvc/checkout_checks_test.go", kind: "test", detail: "TestCheckinByANonHolderIsRefusedAndRotatesNothing, TestConcurrentCheckoutsIssueOneLease" },
      { repo: "sneakers-vault", path: "internal/workflow/grpcsvc/sensitive_checkout_test.go", kind: "test", detail: "TestSensitiveCheckoutNeedsAFreshMFAWhenOn" },
    ],
    mappings: { soc2: ["CC6.1", "CC6.3"], iso27001: ["A.5.18", "A.8.2"] },
  },
  {
    id: "ACC-4",
    area: "access",
    title: "Rotation without agents on targets",
    statement:
      "The connector pulls due heartbeat and rotation jobs and changes passwords over LDAP/LDAPS and Kerberos using the account's own current password, so it needs no admin rights. The directory's built-in Administrator is matched by SID and never rotated. SSH, WinRM and SAMR rotation aren't built.",
    status: "partial",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-connector", path: "README.md", kind: "doc" },
      { repo: "sneakers-connector", path: "internal/adapter/ldap_account_test.go", kind: "test", detail: "TestRotateADBuiltinAdministratorIsRefusedWithoutChange" },
    ],
    mappings: { soc2: ["CC6.1"], iso27001: ["A.5.17"] },
    gaps: [
      { repo: "sneakers-connector", number: 16, title: "SSH, WinRM and SAMR rotation" },
      { repo: "sneakers-connector", number: 33, title: "Respect directory password rules when rotating" },
      { repo: "sneakers-connector", number: 75, title: "Pin LDAPS certificates for an enterprise CA" },
    ],
  },
  {
    id: "ACC-5",
    area: "access",
    title: "Strong generated passwords",
    statement:
      "Generated passwords come from the OS CSPRNG: 20 characters from an 86-character pool by default (about 128 bits), with per-policy length, required classes and excluded characters.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [{ repo: "sneakers-vault", path: "internal/vault/grpcsvc/pwgen_test.go", kind: "test", detail: "TestGeneratePasswordRequiredClasses" }],
    mappings: { iso27001: ["A.5.17"], asvs: ["V6.3.1"] },
  },
  {
    id: "ACC-6",
    area: "access",
    title: "Brokered SSH without handing over the key",
    statement:
      "In-browser SSH uses a single-use ticket that lives 30 seconds and holds no key material. The broker fetches the key as the user when the browser connects, wipes it after use, connects only to pinned host keys and cuts sessions at 8 hours. Sessions aren't recorded yet.",
    status: "partial",
    since: "v0.1.0-rc.2",
    evidence: [
      { repo: "sneakers-sshbroker", path: "internal/session/store_test.go", kind: "test", detail: "TestCreateAndConsumeOnce, TestZeroizeWipesKey" },
      { repo: "sneakers-sshbroker", path: "internal/wsproxy/hostkey_test.go", kind: "test", detail: "TestHandlerConnectsWhenHostKeyPinned" },
    ],
    mappings: { soc2: ["CC6.1"], iso27001: ["A.8.2", "A.8.15"] },
    gaps: [
      { repo: "sneakers-sshbroker", number: 21, title: "Session recording" },
      { repo: "sneakers-sshbroker", number: 26, title: "Reject agent principals" },
    ],
  },
  {
    id: "ACC-7",
    area: "access",
    title: "Values on screen",
    statement:
      "The web UI masks values until revealed and tells the user each reveal is logged. Hiding is manual: there is no auto-hide timer and nothing clears the clipboard after a copy.",
    status: "partial",
    since: "v0.1.0-rc.2",
    evidence: [{ repo: "sneakers-web", path: "apps/staff/app/features/secret/SensitiveValue.tsx", kind: "code" }],
    mappings: { iso27001: ["A.8.12"], asvs: ["V8.2.1"] },
  },

  // Audit trail
  {
    id: "AUD-1",
    area: "audit",
    title: "Hash-chained audit records",
    statement:
      "Each record's SHA-256 covers its sequence, action, actor, subject, attributes, time and the previous record's hash. VerifyChain reports a gap, a wrong link or a wrong hash, walking the chain in pages so it scales.",
    status: "shipped",
    since: "v0.1.0-rc.2",
    evidence: [
      { repo: "sneakers-audit", path: "internal/chain/chain.go", kind: "code" },
      { repo: "sneakers-audit", path: "internal/grpcsvc/audit_test.go", kind: "test", detail: "TestChainLinksAndVerifies, TestTamperBreaksChain" },
    ],
    mappings: { soc2: ["CC7.2", "CC4.1"], iso27001: ["A.8.15", "A.5.33"], asvs: ["V7.3.3"] },
  },
  {
    id: "AUD-2",
    area: "audit",
    title: "Who may write and read the trail",
    statement:
      "Only listed services may record, only the gateway may read, the migration job may only record and verify, and the appliance may only write its own admin events. The service won't start without an issuer.",
    status: "shipped",
    since: "v0.1.0-rc.2",
    evidence: [{ repo: "sneakers-audit", path: "internal/grpcsvc/callers_test.go", kind: "test", detail: "TestCallerAuth_ReadsAreForTheGatewayOnly" }],
    mappings: { soc2: ["CC6.1"], iso27001: ["A.8.15"], asvs: ["V7.3.4"] },
  },
  {
    id: "AUD-3",
    area: "audit",
    title: "Tamper evidence, not tamper resistance",
    statement:
      "The chain is keyless and unsigned, and the database doesn't stop UPDATE or DELETE. It detects edits by anyone without database write access; someone with it could rewrite the chain and recompute every hash. Routine audit writes are best-effort (only break-glass fails closed), and there is no retention setting yet.",
    status: "partial",
    since: "v0.1.0-rc.2",
    evidence: [{ repo: "sneakers-audit", path: "migrations/0001_baseline.up.sql", kind: "code" }],
    mappings: { soc2: ["CC7.2"], iso27001: ["A.8.15"], asvs: ["V7.3.3"] },
    gaps: [
      { repo: "sneakers-audit", number: 60, title: "Signed audit archive" },
      { repo: "sneakers-audit", number: 17, title: "Run more than one instance safely" },
      { repo: "sneakers-audit", number: 18, title: "Record vendor sign-ins and denials" },
    ],
  },
  {
    id: "AUD-4",
    area: "audit",
    title: "No secret values in logs or notices",
    statement:
      "Audit records hold metadata only; reveals record which field, never its value. Notifications have no field that could carry a value. Services and the MCP never log tokens or values. The audit service relies on its callers for this and doesn't check it server-side.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-notify", path: "proto/sneakers/notify/v1/notify.proto", kind: "code" },
      { repo: "sneakers-connector", path: "internal/tokensource/tokensource_test.go", kind: "test", detail: "TestFileNeverLogsToken" },
    ],
    mappings: { soc2: ["C1.1"], iso27001: ["A.8.11", "A.8.15"], asvs: ["V7.1.1", "V7.1.2"] },
  },

  // MCP and machine API
  {
    id: "MCP-1",
    area: "machine",
    title: "Agents sign in with their own token",
    statement:
      "The MCP bridge accepts OAuth JWTs (signature, issuer, audience and expiry checked locally), service-account tokens and personal tokens. Opaque tokens are confirmed by the gateway and cached for at most 60 seconds by hash; any failure is a 401 and is never cached. If the gateway is down, it fails closed.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-mcp", path: "docs/configuration.md", kind: "doc" },
      { repo: "sneakers-mcp", path: "internal/authn/authn_test.go", kind: "test", detail: "TestAPITokenGatewayDownFailsClosed, TestAPITokenRevokedIsRejectedOnceCacheExpires" },
    ],
    mappings: { soc2: ["CC6.1"], iso27001: ["A.8.5"], asvs: ["V3.5.3", "V13.1.3"] },
  },
  {
    id: "MCP-2",
    area: "machine",
    title: "Same rules and audit as a person",
    statement:
      "The bridge holds no credentials and makes no access decisions; it forwards the caller's own token to the machine API, where the vault applies the same folder rules, approvals and audit. Consent to an agent's sign-in needs a recent second factor, using PKCE with S256.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-mcp", path: "README.md", kind: "doc" },
      { repo: "sneakers-gateway", path: "internal/bff/oauth.go", kind: "code" },
    ],
    mappings: { soc2: ["CC6.1", "CC6.3"], iso27001: ["A.5.15"], asvs: ["V4.1.1"] },
    gaps: [{ repo: "sneakers-gateway", number: 145, title: "Keep CLI tokens off the MCP switch" }],
  },
  {
    id: "MCP-3",
    area: "machine",
    title: "What an agent can receive",
    statement:
      "By design an agent with access receives plaintext values: reads of plain fields, approved reveals (once, within 60 seconds) and new values from rotation. Approval-gated secrets return an approval link, not a value. Super-sensitive fields are withheld from every token unless an admin turns on API access to sensitive secrets (off by default). MCP is an add-on, off by default.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [
      { repo: "sneakers-mcp", path: "internal/tools/tools_reveal_test.go", kind: "test", detail: "TestGetSecretOfAnApprovalSecretReturnsTheApprovalLinkNotAValue" },
      { repo: "sneakers-vault", path: "internal/vault/grpcsvc/sensitive_settings_test.go", kind: "test", detail: "TestAPIForSensitiveOffKeepsSuperSensitiveFieldsFromMachines" },
    ],
    mappings: { soc2: ["C1.1"], iso27001: ["A.8.3", "A.8.12"] },
    gaps: [{ repo: "sneakers-mcp", number: 17, title: "Personal tokens of a disabled user" }],
  },

  // Appliance platform
  {
    id: "APL-1",
    area: "appliance",
    title: "Minimal, reproducible, read-only OS",
    statement:
      "The appliance isn't a Linux distribution: it is built from a declared file list (a pinned kernel, busybox, OpenSSH and the project's own programs) with its own init as PID 1 and no setuid files. The root is a read-only SquashFS checked block by block with dm-verity, and the build is reproducible byte for byte.",
    status: "shipped",
    since: "v0.1.0-rc.3",
    evidence: [
      { repo: "sneakers-appliance", path: "docs/root-image.md", kind: "doc" },
      { repo: "sneakers-appliance", path: "build/root/build_test.sh", kind: "test" },
    ],
    mappings: { soc2: ["CC6.8", "CC7.1"], iso27001: ["A.8.9", "A.8.19"] },
    gaps: [{ repo: "sneakers-appliance", number: 45, title: "Build the kernel and static tools from pinned sources" }],
  },
  {
    id: "APL-2",
    area: "appliance",
    title: "Secure Boot with project-owned keys",
    statement:
      "Firmware boots a project-signed systemd-boot and one signed kernel image (UKI) with no shim and no vendor keys. The kernel runs in lockdown, and the dm-verity root hash is inside the signed image. If the box is set to Secure Boot and the firmware stops enforcing it, the product won't start. An admin can choose reduced protection, which is labelled.",
    status: "shipped",
    since: "v0.1.0-rc.3",
    evidence: [
      { repo: "sneakers-appliance", path: "docs/secure-boot.md", kind: "doc" },
      { repo: "sneakers-appliance", path: ".github/workflows/image-e2e.yml", kind: "ci", detail: "QEMU with Secure Boot firmware and a software TPM" },
    ],
    mappings: { soc2: ["CC6.8"], iso27001: ["A.8.9", "A.8.19"], asvs: ["V10.3.2"] },
    gaps: [
      { repo: "sneakers-appliance", number: 413, title: "Production Secure Boot enrolment without a manual key reset" },
      { repo: "sneakers-appliance", number: 62, title: "Turn Secure Boot on or off later and reseal" },
    ],
  },
  {
    id: "APL-3",
    area: "appliance",
    title: "TPM-sealed disk encryption",
    statement:
      "The state and backup partitions are LUKS2 (AES-XTS) under one random 256-bit key, sealed in the TPM to the boot measurements (PCR 7 and 11 with Secure Boot). Without a TPM, including on arm64, the key falls back to a key-file partition, shown as reduced protection. There is no remote attestation.",
    status: "shipped",
    since: "v0.1.0-rc.3",
    evidence: [
      { repo: "sneakers-appliance", path: "docs/key-custody.md", kind: "doc" },
      { repo: "sneakers-appliance", path: "internal/tpm", kind: "code" },
    ],
    mappings: { soc2: ["CC6.1", "C1.1"], iso27001: ["A.8.24", "A.7.10"] },
  },
  {
    id: "APL-4",
    area: "appliance",
    title: "Signed, encrypted, A/B updates",
    statement:
      "An update is checked against the release key built into the running OS, then its channel, size and SHA-256, before it is decrypted. Anything not newer than the running release is refused. Updates install to the inactive slot; three failed boots fall back to the previous release.",
    status: "shipped",
    since: "v0.1.0-rc.3",
    evidence: [
      { repo: "sneakers-appliance", path: "docs/upgrades.md", kind: "doc" },
      { repo: "sneakers-appliance", path: "internal/product/slots_test.go", kind: "test", detail: "downgrade refusal" },
    ],
    mappings: { soc2: ["CC8.1", "CC7.1"], iso27001: ["A.8.19", "A.8.32"], asvs: ["V10.3.2"] },
    gaps: [{ repo: "sneakers-appliance", number: 72, title: "Rotate the update key" }],
  },
  {
    id: "APL-5",
    area: "appliance",
    title: "Certificate-only SSH and a closed firewall",
    statement:
      "SSH accepts only box-issued keys with their certificates, then a TOTP code; no passwords and no root login. A root shell needs a one-time challenge from the admin page. The firewall opens SSH and the admin page only on the management interface, step by step during first boot, and can limit them to an allow-list.",
    status: "shipped",
    since: "v0.1.0-rc.3",
    evidence: [
      { repo: "sneakers-appliance", path: "docs/ssh-and-elevation.md", kind: "doc" },
      { repo: "sneakers-appliance", path: "docs/network.md", kind: "doc" },
    ],
    mappings: { soc2: ["CC6.1", "CC6.6"], iso27001: ["A.8.2", "A.8.5", "A.8.20"] },
  },
  {
    id: "APL-6",
    area: "appliance",
    title: "Hash-chained OS audit log",
    statement:
      "Appliance administration is written to a daily JSONL log on the encrypted volume, each line carrying the previous line's SHA-256. It isn't forwarded off the box yet.",
    status: "partial",
    since: "v0.1.0-rc.3",
    evidence: [{ repo: "sneakers-appliance", path: "docs/os-audit.md", kind: "doc" }],
    mappings: { soc2: ["CC7.2"], iso27001: ["A.8.15"] },
    gaps: [{ repo: "sneakers-appliance", number: 103, title: "Forward the OS audit log" }],
  },

  // Supply chain and releases
  {
    id: "SUP-1",
    area: "supply-chain",
    title: "Signed release artifacts",
    statement:
      "Every release asset (OS image, update headers, release manifest, checksums and a signature per pinned image digest) is signed with cosign using a project-held ECDSA P-256 key. Signatures aren't in a public transparency log, and image signatures are files on the release rather than attached in the registry.",
    status: "shipped",
    since: "v0.1.0-rc.3",
    evidence: [
      { repo: "sneakers-appliance", path: ".github/workflows/release.yml", kind: "ci", detail: "sign job" },
      { repo: "sneakers-appliance", path: "docs/release.md", kind: "doc" },
    ],
    mappings: { soc2: ["CC8.1"], iso27001: ["A.8.32"], asvs: ["V10.3.2", "V14.2.4"] },
  },
  {
    id: "SUP-2",
    area: "supply-chain",
    title: "Protected release keys",
    statement:
      "Production signing keys live only in a protected CI environment that needs the maintainer's approval and accepts only version tags. CI refuses lab keys in a release, keys sit on tmpfs only for the step that uses them, and every other CI run uses fresh lab keys.",
    status: "shipped",
    since: "v0.1.0-rc.3",
    evidence: [{ repo: "sneakers-appliance", path: "docs/runbooks/production-keys.md", kind: "doc" }],
    mappings: { soc2: ["CC6.1", "CC8.1"], iso27001: ["A.8.24", "A.8.31"] },
  },
  {
    id: "SUP-3",
    area: "supply-chain",
    title: "Multi-arch service images",
    statement:
      "Service images are built natively for linux/amd64 and linux/arm64 and published as one image index, so the same release runs on a Raspberry Pi. Appliance update and install images are amd64 only.",
    status: "shipped",
    since: "v0.1.0-rc.3",
    evidence: [{ repo: "sneakers-appliance", path: ".github/workflows/release.yml", kind: "ci", detail: "images job" }],
    mappings: { iso27001: ["A.8.32"] },
  },
  {
    id: "SUP-4",
    area: "supply-chain",
    title: "SBOM and build provenance",
    statement: "No SBOM (SPDX or CycloneDX) or SLSA provenance is published yet. This is the main supply-chain gap.",
    status: "planned",
    evidence: [],
    mappings: { soc2: ["CC7.1", "CC9.2"], iso27001: ["A.5.21", "A.8.30"], asvs: ["V14.2.5"] },
    gaps: [{ repo: "sneakers-release", number: 69, title: "NIST SSDF (SP 800-218) self-assessment" }],
  },

  // Backup and recovery
  {
    id: "REC-1",
    area: "recovery",
    title: "Key escrow to the owner's recovery keys",
    statement:
      "The owner downloads an escrow file holding the disk key and the product's keys (the vault root key and the TOTP key), encrypted with age to one to three SSH recovery keys. A replacement box imports it at first boot so restored data opens.",
    status: "shipped",
    since: "v0.1.0-rc.3",
    evidence: [{ repo: "sneakers-appliance", path: "docs/key-custody.md", kind: "doc", detail: "Sealed items and the escrow" }],
    mappings: { soc2: ["A1.2"], iso27001: ["A.8.13", "A.8.24"] },
  },
  {
    id: "REC-2",
    area: "recovery",
    title: "Encrypted migration bundles",
    statement:
      "sneakers-migrate exports every service's data as an age-encrypted archive, verifies the audit chain end to end on import, and is rehearsed in CI, including a 727,000-record audit chain.",
    status: "shipped",
    since: "v0.1.0-rc.3",
    evidence: [
      { repo: "sneakers-release", path: "docs/migrate.md", kind: "doc" },
      { repo: "sneakers-release", path: ".github/workflows/migrate-rehearsal.yml", kind: "ci" },
    ],
    mappings: { soc2: ["A1.2", "A1.3"], iso27001: ["A.8.13"] },
  },
  {
    id: "REC-3",
    area: "recovery",
    title: "Scheduled backups",
    statement:
      "There are no scheduled or offsite backups yet: the appliance's backup service is a stub and its backup partition is unused. Until then, recovery relies on the escrow and a migration export.",
    status: "planned",
    evidence: [],
    mappings: { soc2: ["A1.2", "A1.3"], iso27001: ["A.8.13", "A.5.30"] },
    gaps: [
      { repo: "sneakers-appliance", number: 462, title: "Scheduled offsite backups" },
      { repo: "sneakers-appliance", number: 106, title: "Backup lifecycle" },
    ],
  },

  // Logging, monitoring and health
  {
    id: "OPS-1",
    area: "operations",
    title: "Readiness that follows real dependencies",
    statement:
      "Each service's gRPC health and /readyz fail while a required dependency (its database, gRPC peers, the workload-identity key set) is down; liveness checks the process only.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [{ repo: "sneakers-vault", path: "internal/server/health_test.go", kind: "test", detail: "TestHealth_ReadinessFollowsRequiredDependencyLivenessDoesNot" }],
    mappings: { soc2: ["A1.1", "CC7.2"], iso27001: ["A.8.16"] },
  },
  {
    id: "OPS-2",
    area: "operations",
    title: "Structured logs and telemetry",
    statement:
      "Services log JSON at a level set per environment (production defaults to error) and can send traces and metrics to an OpenTelemetry collector. The appliance doesn't forward its logs and there is no built-in alerting yet.",
    status: "partial",
    since: "v0.1.0-rc.3",
    evidence: [{ repo: "sneakers-release", path: "docs/values.md", kind: "doc" }],
    mappings: { soc2: ["CC7.2", "CC7.3"], iso27001: ["A.8.15", "A.8.16"] },
    gaps: [
      { repo: "sneakers-appliance", number: 113, title: "Forward logs to syslog or OTLP" },
      { repo: "sneakers-appliance", number: 332, title: "Export logs over OpenTelemetry" },
    ],
  },

  // Secure development and vulnerability handling
  {
    id: "DEV-1",
    area: "development",
    title: "Gated changes on protected branches",
    statement:
      "main accepts only squash-merged pull requests that pass the required checks (build and test, gosec, govulncheck, licence headers, dependency licences and the scrub). Force-push and deletion are blocked. No second reviewer is required: Sneakers has one maintainer today.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [{ repo: ".github", path: ".github/workflows/scrub.yml", kind: "ci" }],
    mappings: { soc2: ["CC8.1"], iso27001: ["A.8.25", "A.8.32"] },
    gaps: [{ repo: "sneakers-release", number: 23, title: "A required release-review group" }],
  },
  {
    id: "DEV-2",
    area: "development",
    title: "Vulnerability and secret scanning",
    statement:
      "govulncheck and gosec run on every pull request and weekly; gitleaks and pattern checks run in the scrub. There is no CodeQL, container image scan or automated dependency update yet, and actions are pinned by commit only in the appliance repo.",
    status: "partial",
    since: "v0.1.0-rc.1",
    evidence: [{ repo: "sneakers-vault", path: ".github/workflows/job-go-security.yaml", kind: "ci" }],
    mappings: { soc2: ["CC7.1"], iso27001: ["A.8.8", "A.8.28"], asvs: ["V14.2.1"] },
    gaps: [{ repo: "sneakers-release", number: 51, title: "Excluded govulncheck finding awaiting an upstream fix" }],
  },
  {
    id: "DEV-3",
    area: "development",
    title: "Test-first changes across layers",
    statement:
      "Behaviour is specified by tests through public APIs, with real Postgres, real sshd and network namespaces where it matters, and the appliance is exercised end to end in QEMU after each merge and nightly.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [{ repo: "sneakers-appliance", path: "docs/testing.md", kind: "doc" }],
    mappings: { soc2: ["CC8.1"], iso27001: ["A.8.29"] },
  },
  {
    id: "DEV-4",
    area: "development",
    title: "Private vulnerability reporting",
    statement:
      "Vulnerabilities are reported privately through GitHub on the affected repository, acknowledged within a few business days, fixed and disclosed on a timeline agreed with the reporter, and credited in the advisory. A signed advisory feed for appliances is planned.",
    status: "shipped",
    since: "v0.1.0-rc.1",
    evidence: [{ repo: ".github", path: ".github/SECURITY.md", kind: "doc" }],
    mappings: { soc2: ["CC2.3", "CC7.3", "CC7.4"], iso27001: ["A.5.24", "A.5.26", "A.8.8"] },
    gaps: [{ repo: "sneakers-appliance", number: 330, title: "Signed vulnerability-advisory feed" }],
  },
];
