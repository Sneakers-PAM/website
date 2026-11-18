---
title: "API Token"
description: "A token for an API: how it's sent (Bearer, OAuth or a custom header), the token itself and the API's URL."
sidebar_position: 5
---

{/* Checked by hand against the sneakers-vault secret-type catalogue at d68f3e0e (v0.1.0-rc.7). The docs repo's draft generator (Sneakers-PAM/docs#21) isn't carried over yet; edit by hand until it is. */}

# 🎟️ API Token

A token for an API: how it's sent (Bearer, OAuth or a custom header), the token itself and the API's URL.

- The token is a fixed value: it can be revealed and copied, never generated or rotated.
- For an agent, prefer `sneakers-run`, which hands the token to one command without it passing through the agent's transcript.

Type id: `type-api-token`. Agents and `sneakers-put` name the type by this id; `sneakers_list_secret_types` lists it.

## 🧾 Fields {#fields}

| Field | Key | Kind | Required | Secret | Notes |
|---|---|---|---|---|---|
| Description | `description` | Multi-line text | No | No |  |
| Scheme | `scheme` | Choice | No | No | One of `Bearer`, `OAuth`, `Custom header`; default `Bearer` |
| Token | `token` | Secret value (never generated) | Yes | Sensitive |  |
| Endpoint / API URL | `endpoint` | Text | No | No |  |
| Notes | `notes` | Multi-line text | No | No |  |

## 🔒 What's secret {#whats-secret}

**Token** is masked until someone who can read the secret reveals or copies it, and every reveal and copy is written to the [audit trail](../../concepts/audit.md). Everything else is plain metadata that anyone who can see the folder can see.

## 🔁 Heartbeat, rotation and check-out {#automation}

- **Heartbeat:** no.
- **Rotation:** no.
- **Check-out:** no.

## 🎯 Targets {#targets}

An API Token takes no target.
