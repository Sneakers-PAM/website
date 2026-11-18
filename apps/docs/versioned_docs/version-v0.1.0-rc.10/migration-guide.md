---
title: Migration guide
description: Moving an existing Sneakers install's users, secrets and folders onto a fresh appliance or Kubernetes install, with the Import page.
---

# 🚚 Migration guide

This guide is for moving an **existing** Sneakers-PAM install's data — users, groups, secrets and
folders — onto a fresh box, through the `:8443` **Import** page. It assumes you already have [a box
set up](./appliance-guide/first-setup.md) with the product installed, but haven't run the product's
own first-run setup yet. The export side, with `sneakers-migrate`, is in the release's
[Moving onto the appliance](https://github.com/Sneakers-PAM/sneakers-release/blob/v0.1.0-rc.7/docs/migrate-appliance.md).

## 🧭 Before you start {#before}

- **Don't run `/admin/setup`.** An import brings the users in before the product's own setup, and
  the box then never offers that setup. If the box already has a product installed and set up (you
  ran setup by mistake, or you're re-using a box), remove it first with `sneakers reset` over SSH —
  an owner's action that empties the product and its data but keeps the box's own admins, keys,
  certificates and network. Apply the product again from Updates, then open Import before setup.
- **Open the Import page first, before anyone visits the new box's sign-in page.** Once the import
  is open, the box goes into maintenance: PostgreSQL, Kratos, the identity service, the vault and
  the audit service keep running (so the import has something to write to), but the gateway and
  the web apps, and with them sign-in and the MCP, are held at zero until the import closes.
- **Export in bundle format 2.0.** The audit trail stays on the old install: an export in format 2.0
  doesn't carry it, and a bundle in format 1.x is refused before anything is written. Export again
  with a current `sneakers-migrate` if yours is older. Keep the old install's audit history with
  that install, or offline, if you need it after you retire it.
- **Pick the first admin.** Have the email, in the old install, of the person who'll be the first
  admin on the new box.

## 📋 The steps {#steps}

The Import page runs one step at a time, each against the bundle and mapping you upload. Opening,
running a step and closing each ask for a fresh authenticator code.

1. **Open.** Turns the import on and shows the box's **import key** — an encryption identity made
   on the box itself, which never leaves it. Encrypt your export to its recipient (`age1...`).
2. **Upload.** The export bundle, and a mapping file, or a proposal sheet and its type rules to
   convert into one.
3. **Review.** A dry run: every secret by folder, name and type, and a mapping template to
   download, with nothing written yet.
4. **Convert** (only if you started from a proposal sheet rather than a ready mapping file).
5. **Check mapping.** Applies the mapping to the bundle in memory and lists what would move, be
   renamed, retyped, created or dropped, before anything is imported.
6. **Import.** Brings the data in, with **Rehearsal** on for a practice run or off for the real
   one. With the first admin's email, this step also makes that admin a one-time password, shown
   once on the page and removed as it's read; everyone else sets a password with "Forgot password"
   and enrols their second factor at first sign-in. The new audit trail starts with one "imported
   from" record: the old install's name and version, the bundle's id, who ran the import and when,
   and how many folders, secrets and users came across.
7. **Verify.** Waits for the product to be fully ready again (every workload rolled out and
   healthy) before it reports done.
8. **Close.** Turns the import off, removes the import key, the export and the step reports from
   the box, and lets the held services scale back up. Download any report you want to keep before
   you close.

There's no rollback: if an import turns out wrong, fix whatever caused it and import again with
**Re-import**, which empties the product's data first. A re-import replaces an earlier import; a
box whose data didn't come from an import at all refuses it.

## 🧮 Sizing a box for the import {#sizing}

Each import step runs as its own job with a 4 GiB memory limit; a step whose limit is more than
the box's free memory right then is refused up front, with a clear reason, instead of starting and
being killed partway through. With the import open, and the gateway and the web apps held, the
box itself uses about 1.3 GiB, so an import needs about 5.3 GiB free. A 16 GiB box keeps about
10.7 GiB to spare while the largest step runs.

The step peaks the box was sized from, about 1.0 GiB (review) up to 2.6 GiB (verify), were measured
on an older format 1.x bundle that carried a 727,000-record audit chain (a 37 MB bundle). A format
2.0 bundle carries no audit records, so its steps need no more than that.

## ⚠️ A failed step, and closing mid-step {#step-failures}

A step the box has to end for its own reasons — most often, the kernel killing it for memory —
shows why on the step's card, such as "the review step ran out of memory (limit 4Gi)", instead of
sitting on "running" forever. **Close** is always available, even with a step still running:
closing then asks you to confirm first ("this stops the running step"), ends that step, and closes
as usual. There's no need to wait out or restart a stuck step just to get the box out of
maintenance.

## 🧪 Rehearsing first {#rehearsal}

Run a rehearsal before the real cutover: an import with **Rehearsal** on, **Verify**, a check of
the product yourself (sign in as the first admin, reveal a secret, check a second user sees only
their folders), then **Re-import** to clear the box for the cutover. Two things worth carrying
into any rehearsal or cutover plan:

- **Nobody can sign in while an import is open, by design.** Closing is what lets anyone in. The
  first admin's one-time password is shown only once, so give it to whoever needs it as soon as
  it's shown.
- **A box only answers its own name once DNS (or your hosts file) points at it.** If you need to
  reach the new box by its real name before the production cutover — to test sign-in, or a web
  terminal session, which needs the served name — a short-lived, local override (a hosts-file
  entry on the machine you're testing from) is the usual way, provided you remove it again right
  after. While it's in place, *everything* on that machine resolves the name to the new box, so
  keep the window short and specific.

## 🔐 Keys, after the import {#keys}

Download a fresh escrow from the `:8443` **Backups** page right after the import. The escrow
carries the product's keys, sealed to your recovery keys, and the box asks for a new one after an
import and after anything else that changes the keys. See [Protection levels](./appliance-guide/protection.md#backups).

## 🏷️ Naming things during a migration {#naming}

If the new box's host name has to change as part of the cutover, change it on the **Network** page
or with `network set hostname=`, then commit. Once the new name is kept, the box applies the
product again with it, so the sign-in, the OAuth issuer and the MCP addresses follow the new name.
That takes the product down and brings it back phase by phase, with no data change, so do it
before the cutover rather than after people start using the box.
