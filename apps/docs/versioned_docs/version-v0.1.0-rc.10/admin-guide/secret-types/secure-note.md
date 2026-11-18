---
title: "Secure Note"
description: "A block of free text that is kept secret: setup steps, a list of answers, anything that isn't a credential with fields of its own."
sidebar_position: 2
---

{/* Checked by hand against the sneakers-vault secret-type catalogue at d68f3e0e (v0.1.0-rc.7). The docs repo's draft generator (Sneakers-PAM/docs#21) isn't carried over yet; edit by hand until it is. */}

# 📝 Secure Note

A block of free text that is kept secret: setup steps, a list of answers, anything that isn't a credential with fields of its own.

- The note is masked like a password and revealed, copied and audited the same way.

Type id: `type-secure-note`. Agents and `sneakers-put` name the type by this id; `sneakers_list_secret_types` lists it.

## 🧾 Fields {#fields}

| Field | Key | Kind | Required | Secret | Notes |
|---|---|---|---|---|---|
| Description | `description` | Multi-line text | No | No |  |
| Note | `note` | Multi-line text | Yes | Sensitive |  |

## 🔒 What's secret {#whats-secret}

**Note** is masked until someone who can read the secret reveals or copies it, and every reveal and copy is written to the [audit trail](../../concepts/audit.md). Everything else is plain metadata that anyone who can see the folder can see.

## 🔁 Heartbeat, rotation and check-out {#automation}

- **Heartbeat:** no.
- **Rotation:** no.
- **Check-out:** no.

## 🎯 Targets {#targets}

A Secure Note takes no target.
