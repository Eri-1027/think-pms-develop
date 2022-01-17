module.exports = {
  pwa: {
    name: 'Think PMS',
    themeColor: '#344955',
    msTileColor: '#000000',
    assetsVersion: process.env.VUE_APP_PMS_VERSION,
    appleMobileWebAppCapable: 'no',
    appleMobileWebAppStatusBarStyle: 'black'
    // configure the workbox plugin
    // workboxPluginMode: 'InjectManifest',
    // workboxOptions: {
    //   swSrc is required in InjectManifest mode.
    //   swSrc: 'src/service-worker.js'
    //   ...other Workbox options...
    //   skipWaiting: true,
    //   clientsClaim: true
    // }
  },
  productionSourceMap: false,
  publicPath: process.env.VUE_APP_PUBLICPATH,
  transpileDependencies: ['vuetify'],
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'production' && process.env.VUE_APP_CUSTOM_MODE !== 'PROD_PWA'
    ) {
      config.output.filename = '[name].[contenthash].js'
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
      config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = ['console.log']
      config.optimization.minimizer[0].options.extractComments = true
    }
  }
}
