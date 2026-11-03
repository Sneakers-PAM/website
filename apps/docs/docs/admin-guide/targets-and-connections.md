---
title: Targets and connections
description: Linking a secret to the system it actually protects, so Sneakers-PAM can check and change it there.
---

# 🔌 Targets and connections

A **target** is the system a secret actually protects — a server, a directory account, a
database. Attaching a secret to a target is what makes [heartbeat and
rotation](../concepts/heartbeat-and-rotation.md) possible: without one, a secret is just stored, with
nothing to check it against. A secret can be attached to more than one target, and each target's
page lists every secret attached to it (see [Secrets and
folders](../concepts/secrets-and-folders.md)).

## 🏗️ Setting one up {#setup}

A **connection** says how Sneakers-PAM reaches a target: its protocol, port and whether it uses
TLS. Connections are shared, so one connection serves every target that picks it. Only a site
admin creates or changes them, on the admin console's **Connections** page. Picking a protocol
fills in its default port. Every install starts with three:

| Connection | Protocol | Port |
|---|---|---|
| Default SSH | SSH | 22 |
| Default WinRM | WinRM, over TLS | 5986 |
| Directory (LDAPS) | LDAPS | 636 |

An LDAP or LDAPS connection also takes a **KDC port**, for a directory whose Kerberos KDC doesn't
listen on the standard port 88. Leave it empty for 88. It's used to prove a password after a
rotation (see [What each protocol can do](#protocols)).

A connection can also name a privileged secret through `privileged_secret_id`. Saving a connection
is a site-admin action, and a change of its privileged secret is audited.

A **target** picks a connection and adds its hostname, plus a domain and a Kerberos realm where
the protocol needs them. For LDAP, a DNS domain (`ad.example.org`) means Active Directory and a DN
(`dc=example,dc=org`) means an lldap-style directory. Kerberos uses the realm, or the domain
upper-cased.

- **Shared targets:** a site admin creates them on the admin console's **Targets** page.
- **Personal targets:** a person who isn't a site admin can create a target in the staff app. It
  belongs to them, and they manage it and pin its host keys.

## 🔑 Pinning SSH host keys {#host-keys}

A target's `ssh_host_keys` list holds the OpenSSH public keys (authorized_keys form, one per line,
at most 16) that the SSH broker and the SSH connector accept for that target. They're public keys,
never secrets.

Only a person can add, change or clear the list: a site admin on any target, or the owner of a
personal target. No token can, not even one whose user is a site admin or the target's owner.
Every change is audited with the fingerprints added and removed, never the keys themselves.

An **unpinned target refuses every connection**: a web SSH session, and the connector's heartbeat
alike. A secret's heartbeat can't be switched on until its target has a pin.

### Pin a host key {#pin}

#### Before you start

- You're a site admin, or the target is your own personal target.
- You have the server's host key fingerprint from another source, such as its console or its
  administrator, to compare against.

#### Steps

1. Open **Scan and pin…** in one of these places:
   1. The target's page in the admin console, under **SSH host keys**.
   1. The **SSH host key** card on the target's page in the staff app (**Scan and pin host key…**).
   1. The secret's **Actions** menu, next to the disabled **Open terminal** (**Scan and pin host
      key…**).
   1. The terminal's **Pin the host key** button, when a session was refused for a missing pin.
1. Compare the key type and SHA256 fingerprint the scan shows against the fingerprint you got from
   the server another way.
1. Select **Pin this key** only if they match.

Pinning doesn't trust the fingerprint you saw on screen alone: the target is scanned a second time
when you confirm, and the key is pinned only if it still matches. If the key changed between the
scan and the confirm, nothing is pinned and you see "the target now offers a different host key;
scan it again".

### When a host key changes {#key-change}

After a real key change (the server was reinstalled, or its host key was rotated), connections to
the target are refused until the new key is pinned. Scanning it again shows the new key beside the
fingerprints already pinned, with a warning, and **Pin this key** waits until you type the target's
hostname to confirm. If you weren't expecting a change, stop and ask the server's admin first.

Pinning adds the new key; it doesn't remove the old ones. A target can hold more than one pin at
once (for a planned rollover, say), and any of them is accepted. To drop an old pin, a site admin
removes its line from **Pinned keys** on the target's page in the admin console and saves.

## 🧮 What each protocol can do {#protocols}

The connection's protocol decides which adapter runs, and what it can actually do against the
target:

| Protocol | Heartbeat | Rotation |
|---|---|---|
| LDAP, LDAPS | Binds as the account | Changes the account's own password (use LDAPS against Active Directory: a plain LDAP bind can't change a password there) |
| Kerberos | Requests a ticket for the account from the KDC (the connection's port, 88 by default) | Changes the password over kpasswd (port 464 of the same host) |
| SSH | A public-key handshake as the account, only against a host presenting a pinned key; no command is run | Not supported — reports unreachable |
| WinRM, SAMR | Registered, but a placeholder today: reports unreachable | Registered, but a placeholder today: reports unreachable |
| Everything else (databases included) | No adapter yet: a heartbeat reports unreachable | No adapter yet: a rotation is reported skipped |

After a rotation, when the target has a Kerberos realm, the new password is proved with a Kerberos
ticket request on the connection's KDC port rather than with another LDAP bind, because Active
Directory can keep accepting the old password over LDAP for a while. Without a realm, the adapter
that made the change checks it.

An SSH target with no usable pin, or whose host presents a key matching none of the pins, is
reported as a failed check, never as a successful one — the connector never offers the account's
key to an unpinned or mismatched host.

An LDAPS target whose certificate fails verification (an unknown issuer, outside its validity
dates, or issued for another host name) reads as **Failed: untrusted certificate**, and the
credential is never sent; see [Heartbeat and
rotation](../concepts/heartbeat-and-rotation.md#untrusted-certificate-or-unreachable). The
certificate has to chain to the system's trusted roots. Pinning a target's TLS certificate, the way
you pin an SSH host key, isn't available yet.

## 🧭 Which secret types use this {#types}

The [secret types](./secret-types/index.md) that take a target are SSH Key, Database Account,
Password Account (SSH), Windows Account (Local), Windows Domain Account and Active Directory
Account. Each type's own page says exactly what heartbeat and rotation it supports once a
connection is in place. SSH Key and Password Account (SSH) secrets can also open a terminal in the
browser on a pinned SSH target.
