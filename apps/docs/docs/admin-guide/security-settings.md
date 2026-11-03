---
title: Security settings
description: The site-wide switches for super-sensitive fields, MFA on checkout and on reveal, top-level folders, and session limits.
---

# 🔐 Security settings

A site admin sets these on the admin console's **Settings** page, in its **Security** panel. They
take effect at once, for the whole site unless the setting says otherwise. "Super-sensitive" means
a field its [secret type](./secret-types/index.md) marks that way: a card number or CVV, a PIN, an
SSN, a bank account's numbers and online password, or a certificate's private key.

| Setting | Default | What it does |
|---|---|---|
| **Require MFA for sensitive checkout** | On | On: checking out a secret whose type has any super-sensitive field needs a second factor from within the MFA window; otherwise the checkout is refused and asks for one. Other types aren't affected. Off: no extra MFA check at checkout. |
| **Require MFA before a reveal** | Off | On: before a person reveals or copies a sensitive field, a second factor older than the MFA window is refused and the web app asks again. A folder can override this for itself and everything under it (see [Per-folder override](#folder-override)). Agents and service accounts are exempt — the [MCP guide](../user-guide/agents-and-the-mcp.md#limits) covers what they can and can't do instead. |
| **Allow API access to sensitive secrets** | Off | Off: service accounts and personal tokens (agents, scripts, `sneakers-run`) can't reveal, prepare or redeem a super-sensitive field. They still reach ordinary password and sensitive fields under their usual access. On: they get super-sensitive fields too, under the same access rules. People signed in to the web app are never affected either way. |
| **Restrict top-level folders to admins** | Off | Off: anyone signed in can create a top-level folder, in the web app or with a personal token, and owns it. On: only site admins and root can, in the web app or through a token whose owner is one. Subfolders aren't affected. See [Top-level folders](../concepts/secrets-and-folders.md#top-level-folders). |

The same panel shows two more things:

- **MFA window:** how recent a second factor must be for every check above, and for version
  history and restore. It's `MFA_MAX_AGE`, from 0 (every time) to 4 hours, 30 minutes by default.
  The page only shows it: it's set where the vault, the workflow and the gateway run, not here.
- **Limits:** **Access-request history retention (days)**, 90 by default, after which resolved
  access requests and their comments are removed; and **Session timeout (minutes)**, between 15
  and 60, 30 by default. Signed-in sessions renew while they're in use. Select **Save limits** to
  apply them.

## 🗂️ Per-folder override {#folder-override}

A site admin sets a folder's override on the admin console's **Folders** page, with the folder
selected, under **Ask for MFA before a reveal**: **Inherit**, **Require** or **Off**. The nearest folder that sets Require or
Off wins, for itself and every folder below it; if none does, the site-wide **Require MFA before a
reveal** applies. Only a site admin sets a folder's override, and each change is audited.

## 🧮 How the switches interact {#interactions}

- Turning off **Allow API access to sensitive secrets** doesn't touch ordinary fields: a service
  account can still read a plain password field on a super-sensitive type, just not the
  super-sensitive field itself.
- **Require MFA before a reveal** and the per-folder override only ever apply to a person in the
  web app. There's no agent-facing equivalent, because an agent's token already can't reach
  super-sensitive fields unless the API switch above is on.
- The MFA window is one setting for the whole install; see [Approvals and
  requests](../concepts/approvals.md#second-factor-mfa).

## 📝 What gets logged {#audit}

Changing any of these settings is written to the [audit trail](../concepts/audit.md) as a security
settings update, with the admin who changed it. A change to **Restrict top-level folders to
admins** also records the old and new value.

A reveal, copy or checkout that a setting refused is logged too: a token refused a super-sensitive
field, a reveal waiting on a fresh second factor, and a checkout refused for one. So a run of
refusals right after a setting changes is easy to trace back to the change.
