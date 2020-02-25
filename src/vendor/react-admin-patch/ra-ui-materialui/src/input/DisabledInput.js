import React from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import { addField, FieldTitle } from 'ra-core'

import sanitizeRestProps from 'ra-ui-materialui/lib/input/sanitizeRestProps'

const DisabledInput = ({
  classes,
  className,
  record,
  input: { value },
  label,
  resource,
  source,
  options,
  isRequired,
  meta,
  ...rest
}) => {
  const { touched, error } = meta

  return (
    <TextField
      disabled
      error={Boolean(touched && error)}
      helperText={touched && error}
      margin="normal"
      value={value}
      label={
        <FieldTitle
          label={label}
          source={source}
          resource={resource}
          isRequired={isRequired}
        />
      }
      className={className}
      classes={classes}
      {...options}
      {...sanitizeRestProps(rest)}
    />
  )
}

DisabledInput.propTypes = {
  classes: PropTypes.object,
  className: PropTypes.string,
  label: PropTypes.string,
  input: PropTypes.object,
  options: PropTypes.object,
  record: PropTypes.object,
  resource: PropTypes.string,
  source: PropTypes.string,
  isRequired: PropTypes.bool,
  meta: PropTypes.object,
}

export default addField(DisabledInput)
