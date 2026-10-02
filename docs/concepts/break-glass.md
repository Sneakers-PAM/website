# Break-glass

Normal access in Sneakers-PAM goes through the owner's rules and, often, an [approval](/concepts/approvals).
**Break-glass** is the deliberately narrower emergency path for when that normal route isn't fast
enough or isn't available — a production incident, for instance.

Using it requires a reason and a six-digit code, not just a click. Once in, every field of the
secret is shown at once, with a copy action and a clear "hide and end" to close out the session.

Break-glass access is treated as a high-severity event everywhere in the product:

- the secret's page shows an active, hard-to-miss "break glass active" marker;
- the action is recorded at the highest audit tier, not folded in with routine reveals;
- the secret is automatically queued for rotation afterward, so the value that was exposed during
  the emergency doesn't stay valid once things are calm.

Because it trades a normal approval step for speed, break-glass use is exactly the kind of record
a post-incident review should look at first.
