import React from 'react'
import { FunctionField } from 'react-admin'
import { get } from 'lodash'

function render(record, source) {
  const value = get(record, source)

  if (value) {
    if (value.length) {
      return value.length
    }

    return Object.keys(value).length
  }

  return 0
}

export default function NbItemsField(props) {
  return <FunctionField {...props} render={render} />
}

NbItemsField.defaultProps = {
  label: 'Number of Items',
}
