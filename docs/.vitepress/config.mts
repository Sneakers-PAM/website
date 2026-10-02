import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'sneakers·pam',
  description: 'An open-source, Apache-2.0 privileged access management system.',
  lang: 'en-US',
  base: '/website/',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/website/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#2F5BD3' }],
  ],

  themeConfig: {
    logo: { light: '/mark-light.svg', dark: '/mark-dark.svg', alt: 'sneakers·pam' },
    siteTitle: 'sneakers·pam',

    nav: [
      { text: 'Getting started', link: '/getting-started' },
      { text: 'Concepts', link: '/concepts/' },
      { text: 'Using the MCP', link: '/mcp-guide' },
      { text: 'Security', link: '/security' },
    ],

    sidebar: [
      {
        text: 'Start here',
        items: [
          { text: 'Home', link: '/' },
          { text: 'Getting started', link: '/getting-started' },
        ],
      },
      {
        text: 'Concepts',
        items: [
          { text: 'Overview', link: '/concepts/' },
          { text: 'Secrets and folders', link: '/concepts/secrets-and-folders' },
          { text: 'Approvals and requests', link: '/concepts/approvals' },
          { text: 'Check-out and check-in', link: '/concepts/check-out' },
          { text: 'Heartbeat and rotation', link: '/concepts/heartbeat-and-rotation' },
          { text: 'Break-glass', link: '/concepts/break-glass' },
          { text: 'Agents and the MCP', link: '/concepts/agents-and-mcp' },
          { text: 'Audit trail', link: '/concepts/audit' },
        ],
      },
      {
        text: 'Guides',
        items: [{ text: 'Using the MCP', link: '/mcp-guide' }],
      },
      {
        text: 'Project',
        items: [
          { text: 'Security', link: '/security' },
          { text: 'Contributing', link: '/contributing' },
          { text: 'Governance', link: '/governance' },
          { text: 'License', link: '/license' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/Sneakers-PAM' }],

    search: { provider: 'local' },

    footer: {
      message: 'Released under the Apache License, Version 2.0.',
      copyright: 'Copyright 2026 The Sneakers-PAM Authors',
    },

    editLink: {
      pattern: 'https://github.com/Sneakers-PAM/website/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
})
