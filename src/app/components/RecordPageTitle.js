/**
 *
 * RecordPageTitle
 *
 */

import React from 'react'
import PropTypes from 'prop-types'

import { get } from 'lodash'

export default function RecordPageTitle({ record, prefix, identifier }) {
  return <span>{`${prefix} "${get(record, identifier)}"`}</span>
}

RecordPageTitle.propTypes = {
  record: PropTypes.object,
  identifier: PropTypes.string,
  prefix: PropTypes.string.isRequired,
}

RecordPageTitle.defaultProps = {
  identifier: 'id',
}
