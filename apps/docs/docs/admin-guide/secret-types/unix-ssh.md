---
title: "Password Account (SSH)"
description: "A Unix or Linux account that signs in over SSH with a password: the host, the username and the password."
sidebar_position: 9
---

{/* Checked by hand against the sneakers-vault secret-type catalogue at d68f3e0e (v0.1.0-rc.7). The docs repo's draft generator (Sneakers-PAM/docs#21) isn't carried over yet; edit by hand until it is. */}

# 🐧 Password Account (SSH)

A Unix or Linux account that signs in over SSH with a password: the host, the username and the password.

- The password can be generated from the password policy, but Sneakers-PAM never checks it or changes it on the host.
- With a target, a person can choose **Open terminal** on the secret's page and get a password SSH session in the browser; the password is used for them and never shown.

Type id: `type-unix-ssh`. Agents and `sneakers-put` name the type by this id; `sneakers_list_secret_types` lists it.

## 🧾 Fields {#fields}

| Field | Key | Kind | Required | Secret | Notes |
|---|---|---|---|---|---|
| Description | `description` | Multi-line text | No | No |  |
| Host | `host` | Text | Yes | No |  |
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

A target with an SSH connection (port 22 by default) and its pinned host keys. The target is where a terminal session opens; there's no heartbeat or rotation against it. With more than one target attached, the terminal asks which one to open. See [targets and connections](../targets-and-connections.md) for how to set one up.
