---
title: "SSH Key"
description: "An SSH account that signs in with a key pair: the username, the key's format, the public key, the private key and its passphrase."
sidebar_position: 4
---

{/* Checked by hand against the sneakers-vault secret-type catalogue at d68f3e0e (v0.1.0-rc.7). The docs repo's draft generator (Sneakers-PAM/docs#21) isn't carried over yet; edit by hand until it is. */}

# 🗝️ SSH Key

An SSH account that signs in with a key pair: the username, the key's format, the public key, the private key and its passphrase.

- Generate the key pair in the vault (Ed25519, RSA 4096, RSA 2048 or ECDSA P-256), or import one you already have. The private key is stored and never shown in the editor again.
- With a target, a person can choose **Open terminal** on the secret's page and get an SSH session in the browser; the key is used for them and never shown.

Type id: `type-ssh-key`. Agents and `sneakers-put` name the type by this id; `sneakers_list_secret_types` lists it.

## 🧾 Fields {#fields}

| Field | Key | Kind | Required | Secret | Notes |
|---|---|---|---|---|---|
| Username | `username` | Text | Yes | No |  |
| Key Format | `keyFormat` | Choice | Yes | No | One of `Ed25519`, `RSA 4096`, `RSA 2048`, `ECDSA P-256`; default `Ed25519` |
| Public Key | `publicKey` | Multi-line text | No | No |  |
| Private Key | `privateKey` | Secret value (never generated) | Yes | Sensitive |  |
| Passphrase | `passphrase` | Secret value (never generated) | No | Sensitive |  |
| Notes | `notes` | Multi-line text | No | No |  |

## 🔒 What's secret {#whats-secret}

**Private Key**, **Passphrase** are masked until someone who can read the secret reveals or copies them, and every reveal and copy is written to the [audit trail](../../concepts/audit.md). Everything else is plain metadata that anyone who can see the folder can see.

## 🔁 Heartbeat, rotation and check-out {#automation}

- **Heartbeat:** yes, against the secret's target ([how it works](../../concepts/heartbeat-and-rotation.md#heartbeat)).
- **Rotation:** no.
- **Check-out:** yes: one person at a time holds it for a lease ([check-out](../../user-guide/check-out.md)).

- The heartbeat signs in to the target with the key (an SSH public-key handshake) and runs no command. It connects only to a host that presents one of the target's pinned SSH host keys.
- There is no SSH key rotation yet, so checking the secret in closes the lease without changing the key.

## 🎯 Targets {#targets}

A target with an SSH connection (port 22 by default) and its pinned host keys. A site admin pins a shared target's host keys, and a personal target's owner pins their own; no token can. The target serves both the heartbeat and brokered sessions, and one key can be attached to several targets, each with its own pins. See [targets and connections](../targets-and-connections.md) for how to set one up.
