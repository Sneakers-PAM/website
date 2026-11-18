---
title: Extension packs
description: The vendor types a site admin can import next to the built-in ones.
sidebar_position: 23
---

{/* Checked by hand against the sneakers-vault secret-type catalogue at d68f3e0e (v0.1.0-rc.7). The docs repo's draft generator (Sneakers-PAM/docs#21) isn't carried over yet; edit by hand until it is. */}

# 📦 Extension packs

Extension packs are vendor types that ship with Sneakers-PAM but aren't installed until a site
admin installs one. Once installed, a pack is a read-only type like the built-in ones: people can
create secrets of it, and nobody can edit it. None of them has heartbeat, rotation or check-out.

## 🧰 Installing a pack {#install}

### Before you start

- You're a site admin, or you're using a personal token whose owner is one.

### From the admin console

1. Open the admin console's **Secret types** page.
1. Select **Import extension pack…**.
1. Select **Install** next to the pack you want. The dialog lists only the packs that aren't
   installed yet.

The same dialog also takes a pack of your own: paste its JSON under **Or paste a pack** and select
**Import**.

### From an agent

An agent can list the packs with `sneakers_list_extension_packs` and install one by its id with
`sneakers_import_extension_pack`, but only through a token whose owner is a site admin or root. The
new type then shows in `sneakers_list_secret_types` for everyone. Each install through a token is
written to the [audit trail](../../concepts/audit.md) under the token's user. See [Using the
MCP](../../mcp-guide.md).

### Uninstalling {#uninstall}

An installed pack has an **Uninstall** action on the **Secret types** page. It's refused while any
secret still uses the type.

## 📋 The packs {#packs}

### Amazon IAM Access Key {#ext-aws-iam-key}

From Amazon Web Services. Type id: `ext-aws-iam-key`.

| Field | Key | Kind | Required | Secret |
|---|---|---|---|---|
| Account ID | `accountId` | Text | No | No |
| Access Key ID | `accessKeyId` | Text | Yes | No |
| Secret Access Key | `secretAccessKey` | Password (can be generated) | Yes | Sensitive |

### Microsoft Azure AD Account {#ext-azure-ad}

From Microsoft Azure. Type id: `ext-azure-ad`.

| Field | Key | Kind | Required | Secret |
|---|---|---|---|---|
| Tenant ID | `tenantId` | Text | Yes | No |
| Application (client) ID | `appId` | Text | Yes | No |
| Client secret | `clientSecret` | Password (can be generated) | Yes | Sensitive |

### Google Cloud Service Account Key {#ext-gcp-sa-key}

From Google Cloud. Type id: `ext-gcp-sa-key`.

| Field | Key | Kind | Required | Secret |
|---|---|---|---|---|
| Project ID | `project` | Text | Yes | No |
| Service account email | `clientEmail` | Text | Yes | No |
| Key (JSON) | `keyJson` | Password (can be generated) | Yes | Sensitive |

### Docusign App SSH Keys {#type-docusign-ssh-keys}

From Docusign. Type id: `type-docusign-ssh-keys`.

| Field | Key | Kind | Required | Secret | Notes |
|---|---|---|---|---|---|
| Integration Key (Client ID) | `integrationKey` | Text | Yes | No |  |
| User ID (Impersonated user GUID) | `userId` | Text | Yes | No |  |
| API Account ID | `apiAccountId` | Text | Yes | No |  |
| Base URI | `baseUri` | Text | No | No | defaults to the Docusign demo environment |
| RSA Private Key | `privateKey` | Secret value (never generated) | Yes | Sensitive |  |
