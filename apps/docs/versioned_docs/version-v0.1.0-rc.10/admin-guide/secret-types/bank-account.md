---
title: "Bank Account"
description: "A bank account: the bank, the account and routing numbers, and the online banking sign-in."
sidebar_position: 13
---

{/* Checked by hand against the sneakers-vault secret-type catalogue at d68f3e0e (v0.1.0-rc.7). The docs repo's draft generator (Sneakers-PAM/docs#21) isn't carried over yet; edit by hand until it is. */}

# 🏦 Bank Account

A bank account: the bank, the account and routing numbers, and the online banking sign-in.

- The editor checks the account number (4 to 17 digits) and the routing number (9 digits) before it saves.

Type id: `type-bank-account`. Agents and `sneakers-put` name the type by this id; `sneakers_list_secret_types` lists it.

## 🧾 Fields {#fields}

| Field | Key | Kind | Required | Secret | Notes |
|---|---|---|---|---|---|
| Description | `description` | Multi-line text | No | No |  |
| Bank name | `bank` | Text | No | No |  |
| Account number | `accountNumber` | Secret value (never generated) | Yes | Super-sensitive | must match `^\d{4,17}$`; at most 17 characters |
| Routing number | `routingNumber` | Secret value (never generated) | No | Super-sensitive | must match `^\d{9}$`; at most 9 characters |
| Online username | `onlineUsername` | Text | No | No |  |
| Online password | `onlinePassword` | Secret value (never generated) | No | Super-sensitive |  |
| Notes | `notes` | Multi-line text | No | No |  |

## 🔒 What's secret {#whats-secret}

**Account number**, **Routing number**, **Online password** are masked until someone who can read the secret reveals or copies them, and every reveal and copy is written to the [audit trail](../../concepts/audit.md). Everything else is plain metadata that anyone who can see the folder can see.

**Account number**, **Routing number**, **Online password** are super-sensitive: the reveal shows a partial mask first and takes a second, deliberate reveal for the whole value. Service accounts and personal tokens can't read them while the **Allow API access to sensitive secrets** setting is off, which is the default ([security settings](../security-settings.md)).

## 🔁 Heartbeat, rotation and check-out {#automation}

- **Heartbeat:** no.
- **Rotation:** no.
- **Check-out:** no.

## 🎯 Targets {#targets}

A Bank Account takes no target.
