# Guide screenshots 📸

> 🖼️ Captures the user-guide screenshots from a running appliance, scrubs them, and checks them before they're saved.

## 🧭 What it does

`capture.mjs` drives headless Chrome over the DevTools protocol (no extra npm packages) against
one lab appliance:

- the `:8443` appliance admin: the sign-in form, then every page in the admin menu;
- the Sneakers-PAM web on `:443`: the sign-in form, the authenticator-code prompt, then the
  dashboard, folders and secrets lists.

Each step in `guides.mjs` becomes `static/img/guides/<guide>-<step>.png`, and
`static/img/guides/captions.yaml` lists every image with its guide, step, source, build and alt
text. Re-running the script regenerates the whole set, so the images always match the build named
in `captions.yaml`.

Some screens can't come from a browser (the VM console) or are only reachable by changing the box
(first setup, a reveal, an update, a revert). `guides.mjs` lists those under `REUSED`: they're
copied from an earlier, already-scrubbed capture set and checked the same way on every run.

## 🔒 Nothing changes on the box

- Steps only open pages, open the menu and fill the two sign-in forms. They never press Apply,
  Save, Issue key, Assign, Reveal or anything else that writes.
- A request guard blocks every write while the script runs: `GET`, `HEAD` and `OPTIONS` pass, a
  `POST` passes only when its RPC method starts with a read verb (`Get`, `List`, `Watch` and so
  on), and sign-in requests pass only during the sign-in steps. Blocked requests are listed under
  `blocked_requests` in `captions.yaml`.
- Signing in and opening pages still adds the box's own audit entries (`signin.password`, and the
  mirror index fetch the Updates page makes on load).

## 🧽 What it scrubs

Before each capture the page is rewritten in place: every text node, visible form value and
labelled attribute (shadow roots and frames included). Password and one-time-code fields are
emptied, and QR codes, canvases and inline images are blurred. The rules live in `scrub.mjs`:

| Found | Replaced with |
| --- | --- |
| IPv4 addresses (except the RFC 5737 ranges) | `192.0.2.10` |
| IPv6 addresses (except `2001:db8::/32`) | `2001:db8::10` |
| Host names and FQDNs, the box address and any `SHOTS_LITERALS` | `sneakers.example.org` |
| Certificate fingerprints, full or shortened | `00:11:22:...:FF` |
| SSH key fingerprints (`SHA256:...`) | `SHA256:EXAMPLE...` |
| MAC addresses | `00:00:5E:00:53:01` |
| UUIDs and serial numbers | `00000000-...`, `EXAMPLE-SERIAL` |
| Setup, recovery and root-shell codes (`XXXX-XXXX-XXXX` shapes) | `XXXX-XXXX-XXXX` |
| Keys and tokens (long base32, base64 or hex runs) | `EXAMPLE-TOKEN` |
| Six-digit authenticator codes | `000000` |

`SHOTS_REPLACE` swaps names first (for example the lab admin's name for `admin`).

After the scrub, two checks run with the same rules, and either one fails the run:

1. **DOM check:** everything a viewer could read off the page (text, visible form values and
   attributes) must have no hits.
2. **OCR check:** every image, live or reused, goes through `tesseract`. OCR misreads of the fake
   values themselves (a misread `example` host name) are allowed; anything else is a hit.

An image with a hit is never written to `static/img/guides/`.

## 🚀 Run it

You need Node.js (see `.nvmrc`), Google Chrome and `tesseract` on the `PATH`, and a lab appliance
you can sign in to. Credentials come from files and commands, never from arguments:

| Variable | Meaning |
| --- | --- |
| `SHOTS_HOST` | The appliance address (both `:8443` and `:443` are used). |
| `SHOTS_BUILD` | The build under capture, written to `captions.yaml`. |
| `SHOTS_SPKI` | Optional. The base64 SPKI hash of the box's certificate, to trust it without a CA. |
| `SHOTS_ADMIN_USER`, `SHOTS_ADMIN_PASSWORD_FILE`, `SHOTS_ADMIN_TOTP_CMD` | The appliance admin. The command prints a current code. |
| `SHOTS_PRODUCT_USER`, `SHOTS_PRODUCT_PASSWORD_FILE`, `SHOTS_PRODUCT_TOTP_CMD` | A Sneakers-PAM user. |
| `SHOTS_LITERALS` | Optional, comma-separated extra strings to replace (host names without a dot). |
| `SHOTS_REPLACE` | Optional, comma-separated `from=to` pairs. |
| `SHOTS_REUSE_DIR`, `SHOTS_REUSE_BUILD` | The folder with the reused images, and the build they came from. |
| `SHOTS_ONLY` | Optional, comma-separated guide names to capture (`captions.yaml` is left alone). |

```bash
SHOTS_HOST=192.0.2.10 SHOTS_BUILD=0.1.0 ... npm run screenshots
```

Run it again on every new build and commit the regenerated images with `captions.yaml`. The
scrub rules have unit tests: `npm test`.
