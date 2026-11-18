---
title: "Anthropic Token"
description: "An Anthropic OAuth token for an AI coding assistant. The value must start with `sk-ant-oa`."
sidebar_position: 20
---

{/* Checked by hand against the sneakers-vault secret-type catalogue at d68f3e0e (v0.1.0-rc.7). The docs repo's draft generator (Sneakers-PAM/docs#21) isn't carried over yet; edit by hand until it is. */}

# 🤖 Anthropic Token

An Anthropic OAuth token for an AI coding assistant. The value must start with `sk-ant-oa`.

- This is a single token, not an OAuth application; for an OAuth client with its own secret and refresh token, use [OAuth Application](./oauth.md).

Type id: `type-anthropic-token`. Agents and `sneakers-put` name the type by this id; `sneakers_list_secret_types` lists it.

## 🧾 Fields {#fields}

| Field | Key | Kind | Required | Secret | Notes |
|---|---|---|---|---|---|
| Description | `description` | Multi-line text | No | No |  |
| Token | `token` | Secret value (never generated) | Yes | Sensitive | must match `^sk-ant-oa` |
| Notes | `notes` | Multi-line text | No | No |  |

## 🔒 What's secret {#whats-secret}

**Token** is masked until someone who can read the secret reveals or copies it, and every reveal and copy is written to the [audit trail](../../concepts/audit.md). Everything else is plain metadata that anyone who can see the folder can see.

## 🔁 Heartbeat, rotation and check-out {#automation}

- **Heartbeat:** no.
- **Rotation:** no.
- **Check-out:** no.

## 🎯 Targets {#targets}

An Anthropic Token takes no target.
