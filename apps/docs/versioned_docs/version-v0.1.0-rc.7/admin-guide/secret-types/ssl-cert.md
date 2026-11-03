---
title: "SSL/PKI Certificate"
description: "A TLS or PKI certificate with its private key and chain. The subject, issuer, names, serial, fingerprint, validity and key details are read from the certificate when it's imported."
sidebar_position: 21
---

{/* Checked by hand against the sneakers-vault secret-type catalogue at d68f3e0e (v0.1.0-rc.7). The docs repo's draft generator (Sneakers-PAM/docs#21) isn't carried over yet; edit by hand until it is. */}

# 📜 SSL/PKI Certificate

A TLS or PKI certificate with its private key and chain. The subject, issuer, names, serial, fingerprint, validity and key details are read from the certificate when it's imported.

- Import a PKCS#12 / PFX, PEM, DER, PKCS#7 or JKS / JCEKS file. The secret's page shows the certificate's details and how long it has left.
- Export it from the same page as PEM (certificate and chain, or with the private key, which can be re-encrypted with a passphrase), PKCS#12 / PFX or a Java keystore (both need a passphrase), or DER (certificate only). Replace the material later from the same page.

Type id: `type-ssl-cert`. Agents and `sneakers-put` name the type by this id; `sneakers_list_secret_types` lists it.

## 🧾 Fields {#fields}

| Field | Key | Kind | Required | Secret | Notes |
|---|---|---|---|---|---|
| Certificate | `certificate` | Multi-line text | Yes | No |  |
| Private Key | `privateKey` | Secret value (never generated) | No | Super-sensitive |  |
| Chain | `chain` | Multi-line text | No | No |  |
| Subject | `subject` | Text | No | No |  |
| Issuer | `issuer` | Text | No | No |  |
| Subject Alternative Names | `sans` | Text | No | No |  |
| Serial Number | `serialNumber` | Text | No | No |  |
| Fingerprint (SHA-256) | `fingerprintSha256` | Text | No | No |  |
| Not Before | `notBefore` | Text | No | No |  |
| Not After | `notAfter` | Text | No | No |  |
| Key Algorithm | `keyAlgorithm` | Text | No | No |  |
| Key Size (bits) | `keyBits` | Text | No | No |  |
| Private Key Present | `hasPrivateKey` | Yes or no | No | No |  |
| CA Certificate | `isCA` | Yes or no | No | No |  |
| Notes | `notes` | Multi-line text | No | No |  |

## 🔒 What's secret {#whats-secret}

**Private Key** is masked until someone who can read the secret reveals or copies it, and every reveal and copy is written to the [audit trail](../../concepts/audit.md). Everything else is plain metadata that anyone who can see the folder can see.

**Private Key** is super-sensitive: the reveal shows a partial mask first and takes a second, deliberate reveal for the whole value. Service accounts and personal tokens can't read it while the **Allow API access to sensitive secrets** setting is off, which is the default ([security settings](../security-settings.md)).

## 🔁 Heartbeat, rotation and check-out {#automation}

- **Heartbeat:** no.
- **Rotation:** no.
- **Check-out:** no.

## 🎯 Targets {#targets}

An SSL/PKI Certificate takes no target: there is no rotation for arbitrary certificates.
