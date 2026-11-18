---
title: "Contact"
description: "A person's contact details: the name, email, phone and postal address."
sidebar_position: 19
---

{/* Checked by hand against the sneakers-vault secret-type catalogue at d68f3e0e (v0.1.0-rc.7). The docs repo's draft generator (Sneakers-PAM/docs#21) isn't carried over yet; edit by hand until it is. */}

# 📇 Contact

A person's contact details: the name, email, phone and postal address.

- The email and phone are treated as secret values: they're masked until someone reveals them, and every reveal is audited.

Type id: `type-contact`. Agents and `sneakers-put` name the type by this id; `sneakers_list_secret_types` lists it.

## 🧾 Fields {#fields}

| Field | Key | Kind | Required | Secret | Notes |
|---|---|---|---|---|---|
| Description | `description` | Multi-line text | No | No |  |
| Full name | `fullName` | Text | Yes | No |  |
| Email | `email` | Secret value (never generated) | No | Sensitive | must match `^[^@\s]+@[^@\s]+\.[^@\s]+$`; at most 254 characters |
| Phone | `phone` | Secret value (never generated) | No | Sensitive | must match `^[0-9+()\-.\s]{7,20}$`; at most 20 characters |
| Address line 1 | `addressLine1` | Text | No | No |  |
| Address line 2 (apt/unit) | `addressLine2` | Text | No | No |  |
| City | `city` | Text | No | No |  |
| State | `state` | Text | No | No |  |
| ZIP | `zip` | Text | No | No |  |
| Notes | `notes` | Multi-line text | No | No |  |

## 🔒 What's secret {#whats-secret}

**Email**, **Phone** are masked until someone who can read the secret reveals or copies them, and every reveal and copy is written to the [audit trail](../../concepts/audit.md). Everything else is plain metadata that anyone who can see the folder can see.

## 🔁 Heartbeat, rotation and check-out {#automation}

- **Heartbeat:** no.
- **Rotation:** no.
- **Check-out:** no.

## 🎯 Targets {#targets}

A Contact takes no target.
