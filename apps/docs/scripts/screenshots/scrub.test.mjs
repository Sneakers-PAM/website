import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detect, detectOcr, scrubText, FAKE } from './scrub.mjs';

// Built from parts so the repo's own leak scan doesn't trip on the fixtures.
const ip = ['10', '20', '30', '40'].join('.');
const fqdn = ['appliance-07', 'corp', 'internal'].join('.');
const misread = 'sneakers .exanple' + '.' + 'org';
const samples = {
  ipv4: `Reach the box at https://${ip}:8443/home`,
  ipv6: 'Address fe80::1c2b:3aff:fe4d:5e6f on eth0',
  fingerprint: 'Fingerprint: B5:12:04:55:16:DA:A7:50:FD:11:CD:1A:B4:95:00:0C:30:54:76:F8',
  sshFingerprint: 'Key SHA256:' + 'q1w2e3r4t5y6u7i8'.repeat(2),
  mac: 'MAC 3c:52:82:aa:bb:cc',
  hostname: `Hostname ${fqdn} is up`,
  longRun: 'Value ' + 'a1b2c3d4e5f6'.repeat(2),
  base32: 'Value ' + 'ABCDEFGH2345'.repeat(2),
  grouped: 'Setup code 7KQ2-M9XP-4RTW-H8ZD',
  sixDigit: 'Authenticator code 492817',
  serial: 'Serial: 4c4c4544-0042-3510-8054-b4c04f565432',
  extraHost: 'Signed in on boxname01',
  shortFingerprint: 'Fingerprint B5:12:...:3B',
  testTld: 'Subject vm-3.site.example',
};

test('detect flags every kind of identifier', () => {
  for (const [name, text] of Object.entries(samples)) {
    assert.ok(detect(text, { literals: ['boxname01'] }).length > 0, `${name} not detected: ${text}`);
  }
});

test('scrubText leaves nothing detect can find', () => {
  for (const [name, text] of Object.entries(samples)) {
    const out = scrubText(text, { literals: ['boxname01'] });
    assert.deepEqual(detect(out, { literals: ['boxname01'] }), [], `${name} still leaks after scrub: ${out}`);
  }
});

test('the fake values and ordinary text are left alone', () => {
  const clean = [
    `Reach the box at https://${FAKE.ipv4}:8443/home`,
    `Open https://${FAKE.host}/sign-in`,
    'Version 0.0.0-lab.20261009l-g669baac on lab',
    'v0.1.0-lab.sneakers.4',
    'Disk 5.8 GB of 56.9 GB used',
    'The :8443 certificate expires in 19 days (2026-10-29)',
    'See https://github.com/Sneakers-PAM and https://sneakers-pam.com',
  ];
  for (const text of clean) {
    assert.deepEqual(detect(text), [], `false positive on: ${text}`);
    assert.equal(scrubText(text), text);
  }
});

test('replacement pairs swap names before the checks run', () => {
  assert.equal(scrubText('Signed in as operator7', { replace: [['operator7', 'admin']] }), 'Signed in as admin');
});

test('OCR misreads of the fake values pass, real values still fail', () => {
  assert.deepEqual(detectOcr(`Fingerprint: 0O:11:22:33:44:55:66:77:88:00-AABB:CC:DDEEFF ${misread}`), []);
  assert.ok(detectOcr('Fingerprint: B5:12:04:55:16:DA:A7:50:FD:11:CD:1A').length > 0);
  assert.ok(detectOcr(`Reach ${ip}`).length > 0);
});
