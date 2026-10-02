# Approvals and requests

Not every action on a secret is self-service. A folder's rules can require that a reveal,
check-out or other sensitive action be **approved** before it happens, by someone other than the
person asking.

## Requesting access

When you don't already have access, you send a **request**: a short reason, attached to the
specific secret or folder you need. The request sits pending until an approver acts on it. You can
cancel a pending request at any time, and a stale request eventually expires on its own.

## Approving

An approver sees the reason, who's asking, and what they're asking for, then approves or denies.
Approving a sensitive action — such as revealing a value directly to an automated agent — carries
its own warning, separate from an ordinary reveal, because the value is leaving the control of a
person.

## What gets logged

Every request and every decision is recorded in the [audit trail](./audit.md), along
with the eventual action it unlocked. Denials are recorded too — a request is evidence either way.
