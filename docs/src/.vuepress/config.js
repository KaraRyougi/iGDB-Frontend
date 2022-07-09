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
  }
}
