const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')
const path = require('path')
const webpack = require('webpack')

/**
 *
 * Returns the `babel` loader from the provided `config`.
 *
 * `create-react-app` defines two `babel` configurations, one for js files
 * found in `src/` and another for any js files found outside that directory.
 * This function can target either using the `isOutsideOfApp` param.
 *
 * @param {*} config The webpack config to search.
 * @param {boolean} isOutsideOfApp Flag for whether to use the `babel-loader`
 * for matching files in `src/` or files outside of `src/`.
 */
const getBabelLoader = (config, isOutsideOfApp) => {
  let babelLoaderFilter

  if (isOutsideOfApp) {
    babelLoaderFilter = rule =>
      rule.loader && rule.loader.includes('babel') && rule.exclude
  } else {
    babelLoaderFilter = rule =>
      rule.loader && rule.loader.includes('babel') && rule.include
  }

  // First, try to find the babel loader inside the oneOf array.
  // This is where we can find it when working with react-scripts@2.0.3.
  let loaders = config.module.rules.find(rule => Array.isArray(rule.oneOf))
    .oneOf

  let babelLoader = loaders.find(babelLoaderFilter)

  // If the loader was not found, try to find it inside of the "use" array, within the rules.
  // This should work when dealing with react-scripts@2.0.0.next.* versions.
  if (!babelLoader) {
    loaders = loaders.reduce((ldrs, rule) => ldrs.concat(rule.use || []), [])
    babelLoader = loaders.find(babelLoaderFilter)
  }

  return babelLoader
}

const addBabelPlugin = (plugin, config, pluginOptions) => {
  getBabelLoader(config).options.plugins.push(
    pluginOptions ? [plugin, pluginOptions] : plugin
  )

  return config
}

module.exports = function override(originalConfig, env) {
  // console.info('originalConfig: ', originalConfig)

  const config = addBabelPlugin(
    '@babel/plugin-proposal-decorators',
    originalConfig,
    {
      legacy: true,
    }
  )

  // console.info('babelLoader: ', babelLoader)

  // throw new Error('Stop')

  config.resolve.plugins = config.resolve.plugins.filter(
    plugin => !(plugin instanceof ModuleScopePlugin)
  )

  if (!config.resolve) {
    config.resolve = {}
  }

  if (!config.resolve.alias) {
    config.resolve.alias = {}
  }

  Object.assign(config.resolve.alias, {
    config: path.resolve(__dirname, './config-entry'),
    '@': path.resolve(__dirname, './src'),
    'react-admin-patch': path.resolve(
      __dirname,
      './src/vendor/react-admin-patch'
    ),
    'firebase-data-provider': path.resolve(
      __dirname,
      './src/vendor/firebase-data-provider'
    ),
    'algolia-data-provider': path.resolve(
      __dirname,
      './src/vendor/algolia-data-provider'
    ),
    assets: path.resolve(__dirname, './assets'),
  })

  // Fixes warning about "iconv-loader"
  // https://github.com/webpack/webpack/issues/3078#issuecomment-400697407
  config.plugins = [
    new webpack.IgnorePlugin(/\/iconv-loader$/),
    ...config.plugins,
  ]

  if (env === 'production') {
    config.plugins = [
      ...config.plugins.filter(
        plugin => plugin.constructor.name !== 'SWPrecacheWebpackPlugin'
      ),

      new SWPrecacheWebpackPlugin({
        dontCacheBustUrlsMatching: /^(api|v1|redirect)\/.$/,
        filename: 'service-worker.js',
        logger(message) {
          if (message.indexOf('Total precache size is') === 0) {
            return
          }

          if (message.indexOf('Skipping static resource') === 0) {
            return
          }
          console.log(message)
        },
        minify: true,
        staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
      }),
    ]
  }

  return config
}
