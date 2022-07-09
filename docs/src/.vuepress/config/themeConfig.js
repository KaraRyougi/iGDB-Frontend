module.exports = {
  // repo: 'sagalbot/vue-select',
  editLinks: false,
  docsDir: 'docs',
  // nav: [{ text: 'Fiber Path', link: 'tools/fiber-path' }],
  sidebar: {
    '/': [
      {
        title: 'Toolbox',
        collapsable: false,
        children: [
          ['tools/fiber-path', 'Global Fiber Paths'],
          ['tools/asn', 'Autonomous Systems'],
          ['tools/ip', 'IP Blocks']
        ],
      },
    ],
  },
}
