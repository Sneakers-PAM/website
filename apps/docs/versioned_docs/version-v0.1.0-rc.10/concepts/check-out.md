# Check-out and check-in

**Check-out** gives one person exclusive, time-limited use of a secret — useful for a shared
account where two people changing the password at once would lock each other out.

Checking out runs three visible steps: the target is rotated to a new value, that value is
verified against the target, and a lease is set for a fixed number of hours. Only then do the
secret's fields unlock for use.

While checked out, the secret shows who holds it and until when. Anyone else who needs it sees
that it's held, and can request it or wait.

**Check-in** rotates the secret again and releases the lease. The old value stops working the
moment check-in completes — Sneakers-PAM tells you so in plain terms, so you're not left wondering
whether the credential you just had is still good.

If a lease runs out without a check-in, the secret becomes available again, and whoever picks it
up next starts with a fresh rotation, the same as any check-out.
