import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-admin'
import SyncIcon from '@material-ui/icons/Sync'

export default function SyncButton({
  basePath,
  label,
  record,
  onClick,
  isDisabled,
  ...rest
}) {
  return (
    <Button
      {...rest}
      disabled={isDisabled(record)}
      onClick={handleClick}
      color="primary"
      label="Sync"
    >
      <SyncIcon />
    </Button>
  )

  function handleClick() {
    onClick(record)
  }
}

SyncButton.propTypes = {
  basePath: PropTypes.string,
  label: PropTypes.string,
  record: PropTypes.object,
  onClick: PropTypes.func,
  isDisabled: PropTypes.func,
}
