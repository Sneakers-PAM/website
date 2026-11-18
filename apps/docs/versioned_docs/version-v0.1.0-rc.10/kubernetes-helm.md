---
title: Kubernetes with Helm
description: Install Sneakers-PAM on your own Kubernetes cluster with the sneakers umbrella chart.
---

# ☸️ Kubernetes with Helm

The appliance is the recommended way to run Sneakers-PAM. Helm on your own Kubernetes is the
supported alternative: it installs the same services from the same pinned release
(`sneakers-release`), and the things the appliance does for you become yours.

| | Appliance | Helm |
|---|---|---|
| Upgrades | Signed packages from `:8443`, with automatic fallback | `helm upgrade`, when you run it |
| Kubernetes | k0s, pinned in the release | Your cluster |
| TLS and the public edge | Built in | Your ingress controller and certificates |
| Backups | Nightly on the box, plus named backup sets and the escrow | Yours: PostgreSQL and the Secrets below |

The full guide, with the ingress, TLS, sizing and bring-your-own settings, is the release's
[Installing Sneakers with Helm](https://github.com/Sneakers-PAM/sneakers-release/blob/v0.1.0-rc.7/docs/install.md).

## ✅ Before you start {#requirements}

- Kubernetes 1.36 or newer, on amd64 or arm64 nodes, and Helm 3.14 or newer (or Helm 4), plus
  `kubectl`, `git` and `openssl`.
- An ingress controller (or another edge) that terminates TLS for your public host and passes
  `X-Forwarded-Proto: https` through.
- A CNI that enforces NetworkPolicies; without one, the policies the chart creates do nothing.
- A default StorageClass for the bundled PostgreSQL and Valkey, or the class set in the values.
- For ACME certificates, cert-manager of your own. The chart never installs cert-manager, an
  ingress controller or any CRD.

## 🛠️ Install {#install}

The charts aren't published to a registry yet, so you install from the
[sneakers-release](https://github.com/Sneakers-PAM/sneakers-release) repository at the release's
tag.

1. Get the charts at the release's tag:

   ```bash
   git clone --branch v0.1.0-rc.7 --depth 1 https://github.com/Sneakers-PAM/sneakers-release.git
   cd sneakers-release
   ```

2. Build the charts' dependencies. The script adds the Valkey and Ory chart repositories, builds
   the shared library into each service chart, then builds the umbrella chart:

   ```bash
   scripts/build-deps.sh
   ```

3. Create the namespace and the vault's root key. It's 32 random bytes, and it is permanent for
   the database: without it no stored secret can be opened. Keep a copy in your secret store.

   ```bash
   kubectl create namespace sneakers
   kubectl -n sneakers create secret generic sneakers-vault-root-key \
     --from-literal=VAULT_ROOT_KEK="$(openssl rand -base64 32)"
   ```

4. Install, with your public host and the release's image tag. A release candidate's images carry
   the rc tag while the charts keep their appVersion, so `global.imageTag` sets it once for every
   service:

   ```bash
   helm install sneakers charts/sneakers -n sneakers \
     --set global.host=sneakers.example.org \
     --set global.imageTag=0.1.0-rc.7 \
     --set vault.secretEnv.VAULT_ROOT_KEK.secretName=sneakers-vault-root-key
   ```

   On arm64 nodes, add the values from the guide's
   [CPU architecture](https://github.com/Sneakers-PAM/sneakers-release/blob/v0.1.0-rc.7/docs/install.md#cpu-architecture)
   section.

5. Check the install:

   ```bash
   helm test sneakers -n sneakers
   ```

Install one release per namespace. On the first start the services can restart once or twice
while PostgreSQL initialises; each applies its own migrations under a lock.

The identity service's `TOTP_ENC_KEY`, which encrypts the authenticator-app secrets, is generated
by default into the `sneakers-identity-generated` Secret. Back it up with the database: without it
everyone has to set up their authenticator app again.

:::tip[k0s clusters]

On k0s the service-account token issuer is `https://kubernetes.default.svc`, not the kubeadm
default. Set `global.workloadIdentityIssuer: https://kubernetes.default.svc`, or every
service-to-service call is refused. `kubectl get --raw /.well-known/openid-configuration` shows
your cluster's issuer.

:::

## 🔑 First-run setup {#setup}

The gateway's first-run setup is off until you give it a setup token. Put one in a Secret, point
`gateway.secretEnv.SETUP_TOKEN.secretName` at it, open `https://sneakers.example.org/admin/setup`
to create the first admin, then remove the value again.

## 🌐 The public edge {#edge}

The two web apps, the gateway, the MCP server and the SSH broker are the only services reached
from outside, all on `global.host`: the web app at `/`, the admin app at `/admin`, the gateway at
`/graphql`, `/machine`, `/auth`, `/setup`, `/oauth2` and `/.well-known/oauth-authorization-server`,
the MCP server at `/mcp` and `/.well-known/oauth-protected-resource`, and the SSH broker at `/ssh`
(a WebSocket). Each chart can render an Ingress, off by default. TLS comes either
from a Secret you provide (the default) or from your own cert-manager Issuer.

## 🧩 Bring your own pieces {#byo}

PostgreSQL, Valkey and Ory Kratos come bundled and on by default; Ory Hydra is bundled and off.
Turn any of them off and point the services at your own. Single sign-on (SAML) goes through Ory
Polis, which isn't bundled. The release's
[install guide](https://github.com/Sneakers-PAM/sneakers-release/blob/v0.1.0-rc.7/docs/install.md#bring-your-own)
has the values for each.

From v0.1.0-rc.7 the umbrella chart also carries a highly available PostgreSQL cluster,
`sneakers-pgha` (the `postgres-ha` dependency), off by default, beside the bundled PostgreSQL. An
upgrade never moves your data to it on its own. The guide's
[Moving to the helm-postgres-ha cluster](https://github.com/Sneakers-PAM/sneakers-release/blob/v0.1.0-rc.7/docs/install.md#moving-to-the-helm-postgres-ha-cluster)
section has the steps, for when you choose to.

## ⬆️ Upgrades and backups {#upgrades}

- **Upgrade** with `helm upgrade` and the new release's chart. Generated passwords and keys are read
  back from their Secrets, so an upgrade never changes them.
- **Back up first:** the services migrate their schemas when the new pods start, and
  `helm rollback` doesn't roll a schema back.
- **Back up together:** the PostgreSQL databases, the vault root key Secret, `sneakers-bundled`,
  `sneakers-kratos` and `sneakers-hydra` when the bundled pieces are used, and any
  `sneakers-<service>-generated` Secret.
- **On `sneakers-pgha`,** the cluster archives its write-ahead log continuously and takes a base
  backup nightly at 01:15 UTC into the `sneakers-pgha-backup` claim. That claim is on the cluster,
  so copy it somewhere else as well.

`helm uninstall sneakers -n sneakers` keeps the PostgreSQL volume and those Secrets, so a reinstall
under the same name finds the same data.
