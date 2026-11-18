---
title: "PIN"
description: "A PIN of 3 to 12 digits."
sidebar_position: 17
---

{/* Checked by hand against the sneakers-vault secret-type catalogue at d68f3e0e (v0.1.0-rc.7). The docs repo's draft generator (Sneakers-PAM/docs#21) isn't carried over yet; edit by hand until it is. */}

# 🔢 PIN

A PIN of 3 to 12 digits.

Type id: `type-pin`. Agents and `sneakers-put` name the type by this id; `sneakers_list_secret_types` lists it.

## 🧾 Fields {#fields}

| Field | Key | Kind | Required | Secret | Notes |
|---|---|---|---|---|---|
| Description | `description` | Multi-line text | No | No |  |
| PIN | `pin` | Secret value (never generated) | Yes | Super-sensitive | must match `^\d{3,12}$`; at most 12 characters |
| Notes | `notes` | Multi-line text | No | No |  |

## 🔒 What's secret {#whats-secret}

**PIN** is masked until someone who can read the secret reveals or copies it, and every reveal and copy is written to the [audit trail](../../concepts/audit.md). Everything else is plain metadata that anyone who can see the folder can see.

**PIN** is super-sensitive: the reveal shows a partial mask first and takes a second, deliberate reveal for the whole value. Service accounts and personal tokens can't read it while the **Allow API access to sensitive secrets** setting is off, which is the default ([security settings](../security-settings.md)).

## 🔁 Heartbeat, rotation and check-out {#automation}

- **Heartbeat:** no.
- **Rotation:** no.
- **Check-out:** no.

## 🎯 Targets {#targets}

A PIN takes no target.
