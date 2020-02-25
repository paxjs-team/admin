const defaultConfig = require('./default.json')
const developmentConfig = require('./development.json')
const stagingConfig = require('./staging.json')
const productionConfig = require('./production.json')
const mergeDeep = require('./utils/mergeDeep')

module.exports = function(environment) {
  defaultConfig.ENVIRONMENT = environment || 'development'

  var envConfig

  switch (defaultConfig.ENVIRONMENT) {
    case 'development':
      envConfig = developmentConfig
      break

    case 'staging':
      envConfig = stagingConfig
      break

    case 'production':
      envConfig = productionConfig
      break
  }

  return mergeDeep(defaultConfig, envConfig)
}
