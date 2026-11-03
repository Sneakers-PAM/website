---
title: "License Key"
description: "A software license key and the product it belongs to."
sidebar_position: 15
---

{/* Generated from the sneakers-vault 30ac7fd9296e secret-type catalogue by the docs repo's draft generator (Sneakers-PAM/docs#21), which isn't carried over yet; edit by hand until it is. */}

# 🧾 License Key

A software license key and the product it belongs to.

Type id: `type-license-key`. Agents and `sneakers-put` name the type by this id; `sneakers_list_secret_types` lists it.

## 🧾 Fields {#fields}

| Field | Key | Kind | Required | Secret | Notes |
|---|---|---|---|---|---|
| Description | `description` | Multi-line text | No | No |  |
| Product | `product` | Text | Yes | No |  |
| License key | `licenseKey` | Secret value (never generated) | Yes | Sensitive |  |
| Notes | `notes` | Multi-line text | No | No |  |

## 🔒 What's secret {#whats-secret}

**License key** is masked until someone who can read the secret reveals or copies it, and every reveal and copy is written to the [audit trail](../../concepts/audit.md). Everything else is plain metadata that anyone who can see the folder can see.

## 🔁 Heartbeat, rotation and check-out {#automation}

- **Heartbeat:** no.
- **Rotation:** no.
- **Check-out:** no.

## 🎯 Targets {#targets}

A License Key takes no target.
