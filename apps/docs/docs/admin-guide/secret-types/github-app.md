---
title: "GitHub App"
description: "A GitHub App's credentials in one secret: its App ID, Client ID, Installation ID and owner, its private key, and its client and webhook secrets."
sidebar_position: 22
---

{/* Checked by hand against the sneakers-vault secret-type catalogue at d68f3e0e (v0.1.0-rc.7). The docs repo's draft generator (Sneakers-PAM/docs#21) isn't carried over yet; edit by hand until it is. */}

# 🐙 GitHub App

A GitHub App's credentials in one secret: its App ID, Client ID, Installation ID and owner, its private key, and its client and webhook secrets.

- The editor takes the App's `.pem` file directly and checks it's an unencrypted RSA private key before it's stored. The secret's page has a **Replace private key…** action for when the key is rotated on GitHub.
- The App ID and Installation ID must be digits only.
- [Storing a GitHub App](../../github-app-guide.md) walks through where each detail comes from on GitHub.

Type id: `type-github-app`. Agents and `sneakers-put` name the type by this id; `sneakers_list_secret_types` lists it.

## 🧾 Fields {#fields}

| Field | Key | Kind | Required | Secret | Notes |
|---|---|---|---|---|---|
| Description | `description` | Multi-line text | No | No |  |
| App ID | `appId` | Text | Yes | No | must match `^\d+$` |
| Client ID | `clientId` | Text | No | No |  |
| Client Secret | `clientSecret` | Secret value (never generated) | No | Sensitive |  |
| Installation ID | `installationId` | Text | No | No | must match `^\d+$` |
| Private Key (PEM) | `privateKey` | Multi-line text | Yes | Sensitive |  |
| Webhook Secret | `webhookSecret` | Secret value (never generated) | No | Sensitive |  |
| Owner Org | `ownerOrg` | Text | Yes | No |  |
| Notes | `notes` | Multi-line text | No | No |  |

## 🔒 What's secret {#whats-secret}

**Client Secret**, **Private Key (PEM)**, **Webhook Secret** are masked until someone who can read the secret reveals or copies them, and every reveal and copy is written to the [audit trail](../../concepts/audit.md). Everything else is plain metadata that anyone who can see the folder can see.

None of them is super-sensitive, so an agent's token can read the private key for automation under its usual access, whatever **Allow API access to sensitive secrets** is set to.

## 🔁 Heartbeat, rotation and check-out {#automation}

- **Heartbeat:** no.
- **Rotation:** no.
- **Check-out:** no.

## 🎯 Targets {#targets}

A GitHub App takes no target.
