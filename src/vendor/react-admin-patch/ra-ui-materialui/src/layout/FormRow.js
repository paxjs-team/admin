import React from 'react'
import PropTypes from 'prop-types'

export default function FormRow(props) {
  return <div>{props.children}</div>
}

FormRow.propTypes = {
  children: PropTypes.any,
}
