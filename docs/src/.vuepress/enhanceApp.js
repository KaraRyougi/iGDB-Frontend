import vSelect from 'vue-select'

export default ({
  Vue, // the version of Vue being used in the VuePress app
  options, // the options for the root Vue instance
  router, // the router instance for the app
  siteData // site metadata
}) => {
  Vue.component('v-select', vSelect)
  /**
   * Remove service workers.
   */
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration
          .unregister()
          .then(() => console.log('Service worker unregistered.'))
          .catch(() => console.log('Error unregistering service worker.'))
      })
    })
  }
}
