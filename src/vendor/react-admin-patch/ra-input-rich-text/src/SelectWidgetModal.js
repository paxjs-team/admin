/**
 *
 * SelectWidgetModal
 *
 */

import React from 'react'
import PropTypes from 'prop-types'

import { SimpleForm } from 'react-admin'
import { SelectInput, ReferenceInput } from 'react-admin-patch'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'

import { withStyles } from '@material-ui/core/styles'

const styles = {
  dialog: {
    minWidth: '30vw',
  },
}

export default
@withStyles(styles)
class SelectWidgetModal extends React.Component {
  static propTypes = {
    classes: PropTypes.object,
    onSelect: PropTypes.func,
  }

  state = {
    isOpen: false,
  }

  render() {
    const { classes } = this.props
    const { isOpen } = this.state

    return (
      <Dialog
        open={isOpen}
        onEscapeKeyDown={this.close}
        onBackdropClick={this.close}
        onClose={this.close}
        classes={{
          paper: classes.dialog,
        }}
      >
        <SimpleForm form="widget-select-form" resource="" toolbar={null}>
          <ReferenceInput
            label="Widget"
            source="widget"
            reference="widgets"
            perPage={1000}
            onChange={this.onWidgetChange}
            fullWidth
          >
            <SelectInput optionText="id" />
          </ReferenceInput>
        </SimpleForm>

        <DialogActions>
          <Button onClick={this.close} color="primary">
            Cancel
          </Button>

          <Button onClick={this.submit} color="primary">
            Select
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  open = () => this.setState({ isOpen: true })

  close = () => this.setState({ isOpen: false })

  onWidgetChange = (event, widgetId) => this.setState({ widgetId })

  submit = () => {
    const { widgetId } = this.state

    if (widgetId) {
      const { onSelect } = this.props

      onSelect && onSelect(widgetId)
    }

    this.close()
  }
}
