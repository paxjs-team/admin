const resolveConfig = require('./config')

const config = resolveConfig(process.env.REACT_APP__ENVIRONMENT)

module.exports = config
