# Concepts

Sneakers-PAM is built from a small set of ideas that show up everywhere in the product. This
section explains each one on its own, so the rest of the docs can refer back to them instead of
re-explaining.

- [Secrets and folders](./secrets-and-folders.md) — where credentials live and how access to
  them is organized.
- [Approvals and requests](./approvals.md) — asking for access, and granting it.
- [Check-out and check-in](./check-out.md) — borrowing exclusive use of a secret.
- [Heartbeat and rotation](./heartbeat-and-rotation.md) — keeping a secret's value in sync
  with the system that uses it, and changing it on a schedule.
- [Break-glass](./break-glass.md) — emergency access when the normal path isn't available.
- [Agents and the MCP](./agents-and-mcp.md) — letting coding agents and other tools use
  secrets under the same rules a person would follow.
- [Audit trail](./audit.md) — the hash-chained record of who did what.
