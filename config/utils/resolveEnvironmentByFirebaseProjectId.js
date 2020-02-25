const development = require('../development.json')
const staging = require('../staging.json')
const production = require('../production.json')

module.exports = function resolveEnvironmentByFirebaseProjectId(projectId) {
  switch (projectId) {
    case development.Firebase.PROJECT_ID:
      return 'development'

    case staging.Firebase.PROJECT_ID:
      return 'staging'

    case production.Firebase.PROJECT_ID:
      return 'production'

    default:
      return 'development'
  }
}
