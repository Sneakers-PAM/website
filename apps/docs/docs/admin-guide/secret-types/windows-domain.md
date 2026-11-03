---
title: "Windows Domain Account"
description: "A Windows domain account in its simplest form: the domain, the username and the password."
sidebar_position: 11
---

{/* Checked by hand against the sneakers-vault secret-type catalogue at d68f3e0e (v0.1.0-rc.7). The docs repo's draft generator (Sneakers-PAM/docs#21) isn't carried over yet; edit by hand until it is. */}

# 🏢 Windows Domain Account

A Windows domain account in its simplest form: the domain, the username and the password.

- For new Active Directory accounts, prefer [Active Directory Account](./active-directory.md), which also sets the NetBIOS name, the logon format and the UPN suffix.

Type id: `type-windows-domain`. Agents and `sneakers-put` name the type by this id; `sneakers_list_secret_types` lists it.

## 🧾 Fields {#fields}

| Field | Key | Kind | Required | Secret | Notes |
|---|---|---|---|---|---|
| Domain | `domain` | Text | Yes | No |  |
| Username | `username` | Text | Yes | No |  |
| Password | `password` | Password (can be generated) | Yes | Sensitive | the field rotation changes |

## 🔒 What's secret {#whats-secret}

**Password** is masked until someone who can read the secret reveals or copies it, and every reveal and copy is written to the [audit trail](../../concepts/audit.md). Everything else is plain metadata that anyone who can see the folder can see.

## 🔁 Heartbeat, rotation and check-out {#automation}

- **Heartbeat:** yes, against the secret's target ([how it works](../../concepts/heartbeat-and-rotation.md#heartbeat)).
- **Rotation:** yes: rotation changes **Password** ([how it works](../../concepts/heartbeat-and-rotation.md#rotation)).
- **Check-out:** yes: one person at a time holds it for a lease ([check-out](../../user-guide/check-out.md)).

- The heartbeat binds to the directory as the account itself. Rotation is a self-service password change made with the current password, so the connector needs no admin rights on the directory. When the target has a Kerberos realm, the new password is then proved over Kerberos, on the connection's KDC port.
- The domain's built-in Administrator (RID 500) is never rotated; its heartbeat still runs.

## 🎯 Targets {#targets}

A target with an LDAPS connection (LDAP over TLS, port 636), an LDAP connection, or a Kerberos connection (the password changes over kpasswd on port 464 of the same host). Active Directory only allows a password change over an encrypted connection, so use LDAPS or Kerberos to rotate. See [targets and connections](../targets-and-connections.md) for how to set one up.
