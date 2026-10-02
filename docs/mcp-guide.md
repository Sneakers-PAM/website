# Using the MCP

This page is a simple guide to using Sneakers-PAM with an AI coding assistant. You don't need to
know how any of it works under the hood. You just need to know what to type.

## What is the MCP?

MCP stands for Model Context Protocol. It's a way for an AI assistant to talk to other tools. The
Sneakers-PAM MCP lets your AI assistant ask Sneakers-PAM for the things it's allowed to see — like
a password or a key — instead of you copying and pasting it by hand.

Think of it like this: the AI assistant doesn't have its own key to the vault. It has to ask you
(or your team's rules) for permission every time, the same way a person would. Nothing happens
in secret.

## Before you start

> Coming in v0.1.0. You'll need Sneakers-PAM set up and your coding assistant connected to the MCP
> server. The exact setup steps will be added here once they're ready.

## Things you can ask it to do

Once it's connected, you can just type plain sentences to your assistant. Here are some examples.

### Find a secret

> "Can you find the database password for the billing service?"

The assistant will look through Sneakers-PAM for a secret that matches and tell you what it
found. It won't show you the actual password unless you ask it to, and unless you're allowed to
see it.

### See what's in a folder

> "What secrets are in the 'staging' folder?"

This lists the names of the secrets, not their values. It's a safe way to look around.

### Reveal a value

> "Reveal the API key for the weather service so I can test it."

This is the one that needs the most care. Revealing a value is always written down in
Sneakers-PAM's history, so there's a record of who asked and when. If your team has turned on
approvals, someone else may need to say yes first.

### Run something with a secret, without seeing it

> "Run the deploy script using the deploy-bot credentials, but don't show me the password."

This is often the safest way to use a secret with an assistant. The password gets used behind the
scenes, and you never actually see it typed out anywhere.

## A few things to keep in mind

- **The assistant follows the same rules you do.** It can't see or do anything you aren't allowed
  to see or do yourself.
- **Asking for a secret to be revealed to an assistant is treated as extra sensitive.** Expect it
  to need more care — and possibly someone else's approval — than just looking something up.
- **When you can, ask it to run something with the secret instead of showing you the secret.**
  That way the value never has to be typed out or saved anywhere, by you or the assistant.
- **Everything is logged.** If something looks wrong later, there's a record to check.

To understand what's happening behind the scenes, see
[Agents and the MCP](/concepts/agents-and-mcp) and [Approvals and requests](/concepts/approvals).
