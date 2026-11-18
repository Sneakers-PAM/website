---
title: Folders and permissions
description: How secrets and folders fit together, and who can see, reveal, approve or just hear about each one.
---

# 📁 Folders and permissions

A **secret** is a credential Sneakers-PAM stores on your behalf: a password, a key, a token, or
another sensitive value. Every secret keeps its full history — each past value stays available,
not just the current one — so you can see what changed and when.

Secrets live in **folders**, and folders can be nested. A folder is where access control actually
happens: who can see that a secret exists, who can reveal its value, who can approve a request for
it, and who is just kept informed. A secret inherits its folder's rules unless it has its own.

A secret can also be linked to one or more [targets](./targets-and-connections.md) — the systems
it actually protects, such as a server account or a database. That link is what makes [heartbeat
and rotation](../concepts/heartbeat-and-rotation.md) possible: Sneakers-PAM can check the secret
against each target, and change them together.

Values are never shown by default. Revealing one is a deliberate action, and it's logged every
time — see [Approvals and requests](../concepts/approvals.md) for how a reveal gets approved and the
[security page](../security.md) for how the project treats sensitive data generally.

## 🧱 Who can do what on a folder {#rules}

A folder's rule set works like a small firewall: each rule names who it's for (a person, a
directory group, or everyone) and what it grants — read and reveal, author (create and edit),
approve, or just stay informed. Rules are checked on the target first, if the secret has one, then
up the chain of folders, so a more specific rule can narrow or widen what a broader one gives.

| Grant | What it lets someone do |
|---|---|
| Read and reveal | See the secret exists, and reveal or use its value |
| Read and reveal, own only | Reveal only the secrets this subject created itself; meant for a service account that also has Author |
| Author | Create and edit secrets in the folder |
| Approve | Decide someone else's request for a secret in the folder |
| Informed | Hear about requests and activity, without being able to approve them |

A folder's owner manages its rules from the folder's **Manage access** action in the staff app. A
site admin can also set them on the admin console's **Folders** page, under the folder's
**Sharing**. In the rules editor, clicking a subject's Reveal cell cycles blank, allow, **own**,
deny; see [Secrets and folders](../concepts/secrets-and-folders.md) for how the own-only grant
works.

A folder's **owner** automatically gets read, approve and author on everything in it and below —
owners are who [approvals](../concepts/approvals.md#who-approves-a-reveal) answer to. Anyone who
can see a folder can see that a secret in it exists, even without read, so people can find it and
ask for access. A site admin reads every shared folder's secrets, but is never an automatic
approver or author: running the site and having standing access to every secret in it are kept
separate on purpose.

## 📂 Top-level folders {#top-level}

By default anyone signed in can create a top-level folder and owns it. A site admin can limit that
with **Restrict top-level folders to admins** on the [security settings](./security-settings.md);
see [Top-level folders](../concepts/secrets-and-folders.md#top-level-folders) for the details.

## 🔀 Moving a secret {#moving}

Moving a secret from a shared folder into someone's personal tree, or the reverse, changes who can
reach it, so it isn't free in both directions: personal to shared needs nothing special, but
shared to personal needs a site admin, or a move request that waits for one. A personal folder
belongs to one person; nobody else, site admins included, sees into it except through
[break-the-glass mode](../concepts/break-glass.md#break-the-glass-mode-for-site-admins).
