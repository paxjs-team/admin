/**
 *
 * EditFormToolbar
 *
 */

import React from 'react'

import { Toolbar, DeleteButton } from 'react-admin'
import PatchedSaveButton from '@/app/components/buttons/PatchedSaveButton'

import { withStyles } from '@material-ui/core'

const styles = {
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}

export default withStyles(styles)(function EditFormToolbar(props) {
  return (
    <Toolbar {...props}>
      <PatchedSaveButton redirect={props.redirect} />

      <DeleteButton />
    </Toolbar>
  )
})
