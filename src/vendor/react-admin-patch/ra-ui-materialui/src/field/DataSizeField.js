import React from 'react'
import PropTypes from 'prop-types'
import prettyBytes from 'pretty-bytes'
import get from 'lodash/get'

export default function DataSizeField({ source, record }) {
  return <span>{prettyBytes(get(record, source))}</span>
}

DataSizeField.propTypes = {
  record: PropTypes.object,
  source: PropTypes.string.isRequired,
}
