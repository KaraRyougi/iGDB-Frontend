const { description } = require('../../package')
const head = require('./config/head')
const plugins = require('./config/plugins')
const themeConfig = require('./config/themeConfig')

module.exports = {
  title: 'Internet Database',
  description,
  head,
  themeConfig,
  plugins,
  configureWebpack: {
    node: {
      global: true,
      process: true
    },
  },
  devServer: {
    proxy: {
      '/asn_org' : 'http://127.0.0.1:3000',
      '/asn_geo' : 'http://127.0.0.1:3000',
      '/asn_search' : 'http://127.0.0.1:3000',
    }
  }
}
