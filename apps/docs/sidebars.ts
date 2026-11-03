/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// Order here is the sidebar order; ids are file paths under docs/ minus ".md".
const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Start here',
      collapsible: false,
      items: [
        {type: 'link', label: 'Home', href: '/'},
        {type: 'doc', id: 'why', label: 'Why Sneakers-PAM'},
        {type: 'doc', id: 'index', label: 'Documentation'},
        {type: 'doc', id: 'getting-started', label: 'Getting started'},
        {type: 'doc', id: 'install-esxi', label: 'Install on VMware ESXi'},
        {type: 'doc', id: 'install-proxmox', label: 'Install on Proxmox VE'},
        {type: 'doc', id: 'release-notes', label: 'Release notes'},
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      collapsible: false,
      items: [
        {type: 'doc', id: 'concepts/index', label: 'Overview'},
        {type: 'doc', id: 'concepts/secrets-and-folders', label: 'Secrets and folders'},
        {type: 'doc', id: 'concepts/approvals', label: 'Approvals and requests'},
        {type: 'doc', id: 'concepts/check-out', label: 'Check-out and check-in'},
        {type: 'doc', id: 'concepts/heartbeat-and-rotation', label: 'Heartbeat and rotation'},
        {type: 'doc', id: 'concepts/break-glass', label: 'Break-glass'},
        {type: 'doc', id: 'concepts/agents-and-mcp', label: 'Agents and the MCP'},
        {type: 'doc', id: 'concepts/audit', label: 'Audit trail'},
      ],
    },
    {
      type: 'category',
      label: 'User guide',
      collapsible: true,
      items: [
        {type: 'doc', id: 'user-guide/index', label: 'Overview'},
        {type: 'doc', id: 'user-guide/sign-in', label: 'Sign in'},
        {type: 'doc', id: 'user-guide/find-secrets', label: 'Find a secret'},
        {type: 'doc', id: 'user-guide/use-secrets', label: 'Use a secret'},
        {type: 'doc', id: 'user-guide/check-out', label: 'Check-out and check-in'},
        {type: 'doc', id: 'user-guide/requests-and-approvals', label: 'Requests and approvals'},
        {type: 'doc', id: 'user-guide/add-and-share', label: 'Add and share'},
        {type: 'doc', id: 'user-guide/break-glass', label: 'Break-glass'},
        {type: 'doc', id: 'user-guide/agents-and-the-mcp', label: 'Agents and the MCP'},
      ],
    },
    {
      type: 'category',
      label: 'Admin guide',
      collapsible: true,
      items: [
        {type: 'doc', id: 'admin-guide/index', label: 'Overview'},
        {type: 'doc', id: 'admin-guide/folders-and-permissions', label: 'Folders and permissions'},
        {type: 'doc', id: 'admin-guide/secret-types/index', label: 'Secret types'},
        {type: 'doc', id: 'admin-guide/targets-and-connections', label: 'Targets and connections'},
        {type: 'doc', id: 'admin-guide/security-settings', label: 'Security settings'},
      ],
    },
    {
      type: 'category',
      label: 'Appliance admin guide',
      collapsible: true,
      items: [
        {type: 'doc', id: 'appliance-guide/index', label: 'Overview'},
        {type: 'doc', id: 'appliance-guide/first-setup', label: 'First setup'},
        {type: 'doc', id: 'appliance-guide/email', label: 'Email'},
        {type: 'doc', id: 'appliance-guide/protection', label: 'Protection levels'},
        {type: 'doc', id: 'appliance-guide/console-and-shells', label: 'Console and shells'},
        {type: 'doc', id: 'appliance-guide/troubleshooting', label: 'Troubleshooting'},
      ],
    },
    {
      type: 'category',
      label: 'Use cases',
      collapsible: false,
      items: [
        {type: 'doc', id: 'use-cases/index', label: 'Overview'},
        {type: 'doc', id: 'use-cases/agent-vault', label: 'A vault for AI agents'},
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsible: false,
      items: [
        {type: 'doc', id: 'mcp-guide', label: 'Using the MCP'},
        {type: 'doc', id: 'appliance-updates-guide', label: 'Updating the appliance'},
        {type: 'doc', id: 'cli-sign-in-guide', label: 'Signing in from the command line'},
        {type: 'doc', id: 'github-app-guide', label: 'Storing a GitHub App'},
        {type: 'doc', id: 'change-type-guide', label: "Changing a secret's type"},
        {type: 'doc', id: 'appliance-network-guide', label: "Changing the appliance's network"},
        {type: 'doc', id: 'support-bundle-guide', label: 'Getting a support bundle'},
        {type: 'doc', id: 'backups-guide', label: 'Backing up and restoring the appliance'},
        {type: 'doc', id: 'telemetry-guide', label: 'Sending telemetry to a collector'},
      ],
    },
    {
      type: 'category',
      label: 'More',
      collapsible: true,
      items: [
        {type: 'doc', id: 'migration-guide', label: 'Migration guide'},
        {type: 'doc', id: 'kubernetes-helm', label: 'Kubernetes with Helm'},
      ],
    },
    {
      type: 'category',
      label: 'Project',
      collapsible: false,
      items: [
        {type: 'doc', id: 'security', label: 'Security'},
        {type: 'doc', id: 'contributing', label: 'Contributing'},
        {type: 'doc', id: 'governance', label: 'Governance'},
        {type: 'doc', id: 'license', label: 'License'},
      ],
    },
  ],
};

export default sidebars;
