import React from 'react'
import PropTypes from 'prop-types'
import { get } from 'lodash'

function stripTags(html) {
  if (html) {
    let tmp = document.createElement('DIV')

    tmp.innerHTML = html

    return tmp.textContent || tmp.innerText || ''
  }

  return null
}

export default function HTMLField({ source, record }) {
  return <span>{stripTags(get(record, source))}</span>
}

HTMLField.propTypes = {
  record: PropTypes.object,
  source: PropTypes.any,
}
