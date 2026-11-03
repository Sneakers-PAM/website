// The guide screenshots, in capture order. Each entry becomes
// static/img/guides/<guide>-<step>.png with its alt text in captions.yaml.
// Every step only reads: pages are opened with GET, menus opened, and the two
// sign-in forms filled. The write guard in capture.mjs blocks anything else.

const openMenu = async (page) => {
  await page.click('button[aria-label="Open menu"]');
  await page.sleep(800);
};

// Live captures. `app` is the :8443 appliance admin or the :443 product web.
export const STEPS = [
  { guide: 'sign-in', step: '01-admin-form', app: 'admin', path: '/', auth: 'none',
    alt: 'The appliance admin sign-in on port 8443: admin name, password and authenticator code.' },
  { guide: 'sign-in', step: '02-product-form', app: 'product', path: '/sign-in', auth: 'none',
    alt: 'The Sneakers-PAM sign-in page with the local login form.' },
  { guide: 'sign-in', step: '03-product-code', app: 'product', path: null, auth: 'product-password',
    alt: 'After the password, Sneakers-PAM asks for the authenticator code.' },

  { guide: 'status', step: '01-page', app: 'admin', path: '/home', auth: 'admin',
    alt: 'The appliance Status page: running version, protection, disk, health and the TLS certificate.' },
  { guide: 'status', step: '02-menu', app: 'admin', path: '/home', auth: 'admin', before: openMenu,
    alt: 'The appliance admin menu with every page listed.' },
  { guide: 'updates', step: '01-page', app: 'admin', path: '/updates', auth: 'admin',
    alt: 'The Updates page: the running base and product versions and the mirror check.' },
  { guide: 'network', step: '01-page', app: 'admin', path: '/network', auth: 'admin',
    alt: 'The Network page with the address, gateway and DNS settings.' },
  { guide: 'ssh-access', step: '01-page', app: 'admin', path: '/access', auth: 'admin',
    alt: 'The Access page, where admins get SSH keys for the closed shell.' },
  { guide: 'root-shell', step: '01-page', app: 'admin', path: '/root-shell', auth: 'admin',
    alt: 'The Root shell page, which explains the challenge and response for break-glass access.' },
  { guide: 'certificates', step: '01-page', app: 'admin', path: '/certificates', auth: 'admin',
    alt: 'The Certificates page for the admin and product TLS certificates.' },
  { guide: 'backups', step: '01-page', app: 'admin', path: '/backups', auth: 'admin',
    alt: 'The Backups page.' },
  { guide: 'mcp', step: '01-appliance-page', app: 'admin', path: '/mcp', auth: 'admin',
    alt: 'The MCP page on the appliance admin.' },
  { guide: 'modules', step: '01-page', app: 'admin', path: '/modules', auth: 'admin',
    alt: 'The Add-on modules page.' },
  { guide: 'logs', step: '01-page', app: 'admin', path: '/logs', auth: 'admin',
    alt: 'The Logs and audit page with the appliance audit trail.' },
  { guide: 'power', step: '01-page', app: 'admin', path: '/power', auth: 'admin',
    alt: 'The Power page with restart and shut down.' },

  { guide: 'product', step: '01-dashboard', app: 'product', path: '/', auth: 'product',
    alt: 'The Sneakers-PAM dashboard after sign-in.' },
  { guide: 'product', step: '02-folders', app: 'product', path: '/folders', auth: 'product',
    alt: 'The folders list in Sneakers-PAM.' },
  { guide: 'product', step: '03-secrets', app: 'product', path: '/secrets', auth: 'product',
    alt: 'The secrets list in Sneakers-PAM. Values stay hidden until someone reveals one.' },
];

// Screens that can't be captured from a browser (the VM console) or that are
// only reachable by changing the box (first setup, reveal, update, revert).
// They come from an earlier, already-scrubbed capture set and are re-checked
// by OCR on every run.
export const REUSED = [
  { src: '01-boot-secure-boot.png', guide: 'first-boot', step: '01-secure-boot', alt: 'The VM console while the appliance boots with Secure Boot.' },
  { src: '02-boot-protection.png', guide: 'first-boot', step: '02-protection', alt: 'The console shows the protection level the box booted with.' },
  { src: '03-console-setup-code.png', guide: 'first-boot', step: '03-setup-code', alt: 'The console shows the address to open and the one-time setup code.' },
  { src: '04-setup-first-admin.png', guide: 'setup', step: '01-first-admin', alt: 'Setup: create the first appliance admin.' },
  { src: '05-setup-authenticator.png', guide: 'setup', step: '02-authenticator', alt: 'Setup: add the authenticator app.' },
  { src: '07-setup-protection.png', guide: 'setup', step: '04-protection', alt: 'Setup: the protection summary.' },
  { src: '10-console-status.png', guide: 'first-boot', step: '04-console-status', alt: 'The console status screen after setup.' },
  { src: '14-product-install.png', guide: 'updates', step: '03-product-install', alt: 'Installing the verified product release.' },
  { src: '18-sneakers-audit.png', guide: 'product', step: '05-audit', alt: 'The Sneakers-PAM audit log.' },
  { src: '19-update-mirror-sample.png', guide: 'updates', step: '04-mirror', alt: 'Updates found on the mirror.' },
  { src: '21-update-revert-dialog.png', guide: 'updates', step: '06-revert-dialog', alt: 'The revert dialog asks for the version and an authenticator code.' },
  { src: '22-update-reverted.png', guide: 'updates', step: '07-reverted', alt: 'The Status page after a revert.' },
  { src: '23-reboot-page.png', guide: 'power', step: '02-restarting', alt: 'The page shown while the box restarts.' },
];
