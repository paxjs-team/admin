/**
 *
 * ShowFormValuesAction
 *
 */

import React from 'react'
import PropTypes from 'prop-types'

import CloseIcon from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import ReactJson from 'react-json-view'
import { Button } from 'react-admin-patch'

import { getFormValues } from 'redux-form'

import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  dialog: {
    minWidth: '90vw',
    minHeight: '90vh',
  },

  dialogCloseButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 10,
  },

  dialogContent: {
    padding: 0,
  },

  json: {
    padding: 10,
    fontSize: 16,
  },
}

export default
@connect((state, { record }) => ({
  formData: getFormValues('record-form')(state) || record,
}))
@withStyles(styles)
class ShowFormValuesAction extends React.Component {
  static propTypes = {
    classes: PropTypes.object,
    formData: PropTypes.object,
  }

  static defaultProps = {
    formData: {},
  }

  state = {
    isOpen: false,
  }

  render() {
    const { classes, formData } = this.props
    const { isOpen } = this.state

    return (
      <React.Fragment>
        <Button color="primary" label="Form" onClick={this.open} />

        <Dialog
          open={isOpen}
          onEscapeKeyDown={this.close}
          onBackdropClick={this.close}
          onClose={this.close}
          classes={{ paper: classes.dialog }}
          disableEnforceFocus
        >
          <IconButton
            aria-label="Close"
            className={classes.dialogCloseButton}
            onClick={this.close}
          >
            <CloseIcon />
          </IconButton>

          <DialogContent className={classes.dialogContent}>
            <ReactJson
              src={formData}
              style={styles.json}
              name={null}
              groupArraysAfterLength={10}
              displayObjectSize={false}
              displayDataTypes={false}
            />
          </DialogContent>
        </Dialog>
      </React.Fragment>
    )
  }

  open = () => this.setState({ isOpen: true }, () => {})

  close = () => this.setState({ isOpen: false })
}
