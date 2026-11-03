---
title: "Secure Note"
description: "A block of free text that is kept secret: setup steps, a list of answers, anything that isn't a credential with fields of its own."
sidebar_position: 2
---

{/* Generated from the sneakers-vault 30ac7fd9296e secret-type catalogue by the docs repo's draft generator (Sneakers-PAM/docs#21), which isn't carried over yet; edit by hand until it is. */}

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
