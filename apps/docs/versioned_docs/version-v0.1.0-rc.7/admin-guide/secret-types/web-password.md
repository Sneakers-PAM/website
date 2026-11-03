---
title: "Web Password"
description: "A sign-in for a website or web app: its URL, the username and the password."
sidebar_position: 3
---

{/* Checked by hand against the sneakers-vault secret-type catalogue at d68f3e0e (v0.1.0-rc.7). The docs repo's draft generator (Sneakers-PAM/docs#21) isn't carried over yet; edit by hand until it is. */}

# 🌐 Web Password

A sign-in for a website or web app: its URL, the username and the password.

- The URL is stored as plain text, so people can find the right secret by the site it belongs to.

Type id: `type-web-password`. Agents and `sneakers-put` name the type by this id; `sneakers_list_secret_types` lists it.

## 🧾 Fields {#fields}

| Field | Key | Kind | Required | Secret | Notes |
|---|---|---|---|---|---|
| Description | `description` | Multi-line text | No | No |  |
| URL | `url` | Text | Yes | No |  |
| Username | `username` | Text | Yes | No |  |
| Password | `password` | Password (can be generated) | Yes | Sensitive |  |
| Notes | `notes` | Multi-line text | No | No |  |

## 🔒 What's secret {#whats-secret}

**Password** is masked until someone who can read the secret reveals or copies it, and every reveal and copy is written to the [audit trail](../../concepts/audit.md). Everything else is plain metadata that anyone who can see the folder can see.

## 🔁 Heartbeat, rotation and check-out {#automation}

- **Heartbeat:** no.
- **Rotation:** no.
- **Check-out:** no.

## 🎯 Targets {#targets}

A Web Password takes no target: nothing signs in to the website for you.
