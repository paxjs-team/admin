import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'
import CloseIcon from '@material-ui/icons/Close'
import classnames from 'classnames'
import { translate } from 'ra-core'

import Button from 'ra-ui-materialui/lib/button/Button'
import { FormName, change } from 'redux-form'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import MuiButton from '@material-ui/core/Button'

const styles = {
  disconnectButton: {
    color: '#A91B60',
    '&:hover': {
      backgroundColor: fade('#A91B60', 0.12),
      // Reset on mouse devices
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
  },

  confirmDialogWithContent: {
    width: '30vw',
  },

  confirmDialogWithoutContent: {
    width: 300,
  },
}

const sanitizeRestProps = ({
  basePath,
  classes,
  label,
  resource,
  change,
  ...rest
}) => rest

class DisconnectButton extends Component {
  state = {
    isConfirmDialogOpen: false,
  }

  render() {
    const {
      label = 'Disconnect',
      classes = {},
      className,
      icon,
      undoable,
      confirmDialogText,
      ...rest
    } = this.props
    const { isConfirmDialogOpen } = this.state

    return (
      <React.Fragment>
        <Button
          onClick={this.handleButtonClick}
          label={label}
          className={classnames(
            // 'ra-delete-button',
            classes.disconnectButton,
            className
          )}
          key="button"
          {...sanitizeRestProps(rest)}
        >
          {icon}
        </Button>

        {undoable === false ? (
          <Dialog
            open={isConfirmDialogOpen}
            onEscapeKeyDown={this.closeConfirmDialog}
            onBackdropClick={this.closeConfirmDialog}
            onClose={this.closeConfirmDialog}
            classes={{
              paper: confirmDialogText
                ? classes.confirmDialogWithContent
                : classes.confirmDialogWithoutContent,
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">Are you sure?</DialogTitle>

            {confirmDialogText ? (
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {confirmDialogText}
                </DialogContentText>
              </DialogContent>
            ) : null}

            <DialogActions>
              <MuiButton onClick={this.closeConfirmDialog} color="default">
                CANCEL
              </MuiButton>

              <MuiButton
                onClick={this.handleConfirm}
                color="secondary"
                autoFocus
              >
                CONFIRM
              </MuiButton>
            </DialogActions>
          </Dialog>
        ) : null}
      </React.Fragment>
    )
  }

  handleButtonClick = event => {
    event.stopPropagation()

    if (this.props.undoable) {
      this.disconnect()
    } else {
      this.setState({ isConfirmDialogOpen: true })
    }
  }

  disconnect = () => {
    const { source, record, change, form } = this.props

    change(form, `${source}.${record.id}`, null)
  }

  handleConfirm = () =>
    this.setState({ isConfirmDialogOpen: false }, () => this.disconnect())

  closeConfirmDialog = () => this.setState({ isConfirmDialogOpen: false })
}

DisconnectButton.propTypes = {
  basePath: PropTypes.string,
  classes: PropTypes.object,
  className: PropTypes.string,
  source: PropTypes.string,
  label: PropTypes.string,
  change: PropTypes.func,
  form: PropTypes.string,
  record: PropTypes.object,
  resource: PropTypes.string.isRequired,
  translate: PropTypes.func,
  icon: PropTypes.element,
  undoable: PropTypes.bool,
  confirmDialogText: PropTypes.string,
}

DisconnectButton.defaultProps = {
  icon: <CloseIcon />,
  undoable: true,
}

const DisconnectButtonWithForm = props => (
  <FormName>
    {({ form, ...rest }) => (
      <DisconnectButton form={form} {...props} {...rest} />
    )}
  </FormName>
)

export default compose(
  connect(null, {
    change,
  }),
  translate,
  withStyles(styles)
)(DisconnectButtonWithForm)
