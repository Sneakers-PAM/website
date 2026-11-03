---
title: "Active Directory Account"
description: "An Active Directory account: the domain, its NetBIOS name, the logon format and UPN suffix, the account name and the password, plus two flags for service accounts and gMSAs."
sidebar_position: 12
---

{/* Checked by hand against the sneakers-vault secret-type catalogue at d68f3e0e (v0.1.0-rc.7). The docs repo's draft generator (Sneakers-PAM/docs#21) isn't carried over yet; edit by hand until it is. */}

# 🗂️ Active Directory Account

An Active Directory account: the domain, its NetBIOS name, the logon format and UPN suffix, the account name and the password, plus two flags for service accounts and gMSAs.

- The logon format decides the name a bind uses: NETBIOS signs in as `NETBIOS\username`, UPN as `username@suffix` (or `username@domain` without a suffix). Leave it unset for the default, `username@domain`.
- The Service account and gMSA account flags are yes/no markers on the secret.

Type id: `type-active-directory`. Agents and `sneakers-put` name the type by this id; `sneakers_list_secret_types` lists it.

## 🧾 Fields {#fields}

| Field | Key | Kind | Required | Secret | Notes |
|---|---|---|---|---|---|
| Description | `description` | Multi-line text | No | No |  |
| Domain (FQDN) | `domain` | Text | Yes | No |  |
| NetBIOS domain | `netbios` | Text | No | No |  |
| Logon format | `logonFormat` | Choice | No | No | One of `NETBIOS`, `UPN` |
| UPN suffix | `upnSuffix` | Text | No | No |  |
| Account Name | `username` | Text | Yes | No |  |
| Password | `password` | Password (can be generated) | Yes | Sensitive | the field rotation changes |
| Service account | `serviceAccount` | Yes or no | No | No |  |
| gMSA account | `gmsa` | Yes or no | No | No |  |
| Notes | `notes` | Multi-line text | No | No |  |

## 🔒 What's secret {#whats-secret}

**Password** is masked until someone who can read the secret reveals or copies it, and every reveal and copy is written to the [audit trail](../../concepts/audit.md). Everything else is plain metadata that anyone who can see the folder can see.

## 🔁 Heartbeat, rotation and check-out {#automation}

- **Heartbeat:** yes, against the secret's target ([how it works](../../concepts/heartbeat-and-rotation.md#heartbeat)).
- **Rotation:** yes: rotation changes **Password** ([how it works](../../concepts/heartbeat-and-rotation.md#rotation)).
- **Check-out:** yes: one person at a time holds it for a lease ([check-out](../../user-guide/check-out.md)).

- The heartbeat binds to the directory as the account itself, and also records whether the account is the domain's built-in Administrator and whether `adminCount` is set.
- Rotation is a self-service password change made with the current password, so the connector needs no admin rights on the directory. When the target has a Kerberos realm, the new password is then proved over Kerberos, on the connection's KDC port (88 unless the connection sets another).
- The built-in Administrator (RID 500, matched by its SID, never by name) is never rotated; its heartbeat still runs.

## 🎯 Targets {#targets}

A target with an LDAPS connection (port 636), an LDAP connection, or a Kerberos connection (kpasswd on port 464 of the same host). Active Directory only allows a password change over an encrypted connection, so use LDAPS or Kerberos to rotate. An LDAPS certificate has to chain to the system's trusted roots; one that doesn't is reported as an untrusted certificate and the password is never sent. See [targets and connections](../targets-and-connections.md) for how to set one up.
