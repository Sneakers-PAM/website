---
title: "OAuth Application"
description: "An OAuth 2.0 application: its client ID and client secret, its redirect URL, and the access and refresh tokens it has obtained."
sidebar_position: 6
---

{/* Generated from the sneakers-vault 30ac7fd9296e secret-type catalogue by the docs repo's draft generator (Sneakers-PAM/docs#21), which isn't carried over yet; edit by hand until it is. */}

# 🪪 OAuth Application

An OAuth 2.0 application: its client ID and client secret, its redirect URL, and the access and refresh tokens it has obtained.

- The client secret and both tokens are fixed secret values: Sneakers-PAM stores them but never generates or refreshes them.

Type id: `type-oauth`. Agents and `sneakers-put` name the type by this id; `sneakers_list_secret_types` lists it.

## 🧾 Fields {#fields}

| Field | Key | Kind | Required | Secret | Notes |
|---|---|---|---|---|---|
| Description | `description` | Multi-line text | No | No |  |
| Client ID | `clientId` | Text | Yes | No |  |
| Client Secret | `clientSecret` | Secret value (never generated) | Yes | Sensitive |  |
| Redirect URL | `redirectUrl` | Text | No | No |  |
| Access Token | `accessToken` | Secret value (never generated) | No | Sensitive |  |
| Refresh Token | `refreshToken` | Secret value (never generated) | No | Sensitive |  |
| Notes | `notes` | Multi-line text | No | No |  |

## 🔒 What's secret {#whats-secret}

**Client Secret**, **Access Token**, **Refresh Token** are masked until someone who can read the secret reveals or copies them, and every reveal and copy is written to the [audit trail](../../concepts/audit.md). Everything else is plain metadata that anyone who can see the folder can see.

## 🔁 Heartbeat, rotation and check-out {#automation}

- **Heartbeat:** no.
- **Rotation:** no.
- **Check-out:** no.

## 🎯 Targets {#targets}

An OAuth Application takes no target.
