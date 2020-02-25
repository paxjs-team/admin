/**
 *
 * GroupInput
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import AddIcon from '@material-ui/icons/Add'
import ClearIcon from '@material-ui/icons/Clear'
import IconButton from '@material-ui/core/IconButton'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { withStyles } from '@material-ui/core/styles'
import Labeled from 'ra-ui-materialui/lib/input/Labeled'
import { FormName, change, getFormValues } from 'redux-form'

import { connect } from 'react-redux'
import { get } from 'lodash'

import MenuItem from '@material-ui/core/MenuItem'
import { FieldTitle } from 'ra-core'

const styles = theme => ({
  input: {
    minWidth: theme.spacing.unit * 20,
  },

  container: {
    marginTop: 20,
  },

  label: {
    lineHeight: '25px',
    fontSize: '21px',
    color: 'rgba(0, 0, 0, 0.45)',
    verticalAlign: 'middle',
  },

  textField: {
    width: 375,
    marginTop: 20,
  },

  dialogCancelButton: {
    margin: 10,
    backgroundColor: 'red',
  },

  confirmDialog: {
    width: 300,
  },

  entry: {
    marginBottom: 20,
    marginRight: 10,
    display: 'inline-block',
    position: 'relative',
  },

  removeEntryButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },

  dialog: {
    minWidth: '30vw',
  },
})

class GroupInputView extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    source: PropTypes.string,
    children: PropTypes.any,
    change: PropTypes.func,
    form: PropTypes.string,
    keyGenerator: PropTypes.func,
    classes: PropTypes.object,
    validateKey: PropTypes.array,
    value: PropTypes.object,
    keyChoices: PropTypes.array,
    undoable: PropTypes.bool,
  }

  state = {
    newEntryKeyError: '',
    orderedEntries: this.props.value
      ? Object.keys(this.props.value)
      : undefined,
    isDialogOpen: false,
    isRemovingEntryConfirmDialogOpen: false,
  }

  newEntryKey = ''

  render() {
    const {
      label,
      keyGenerator,
      source,
      children,
      classes,
      change,
      form,
      validateKey,
      value,
      keyChoices,
      ...rest
    } = this.props
    const {
      isDialogOpen,
      orderedEntries,
      newEntryKeyError,
      isRemovingEntryConfirmDialogOpen,
    } = this.state

    return (
      <div className={classes.container}>
        <div>
          {keyChoices && keyChoices.length ? (
            <TextField
              select
              value=""
              margin="normal"
              label={<FieldTitle label={label} />}
              className={classes.input}
              onChange={this.onSelectKeyChoice}
            >
              {keyChoices.map(choice => (
                <MenuItem
                  key={choice.id}
                  value={choice.id}
                  disabled={
                    orderedEntries && orderedEntries.includes(choice.id)
                  }
                >
                  {choice.name}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <React.Fragment>
              <span className={classes.label}>{label}</span>{' '}
              <IconButton tooltip={`Add ${label}`} onClick={this.onAddEntry}>
                <AddIcon color="primary" />
              </IconButton>
            </React.Fragment>
          )}
        </div>

        {orderedEntries &&
          orderedEntries.map(id => {
            let fields

            if (typeof children === 'function') {
              fields = children(id)
            } else {
              fields = children
            }

            if (fields && fields.type && fields.type === React.Fragment) {
              fields = fields.props.children
            }

            const childrenToRender = React.Children.map(fields, field => {
              let newSource = `${source}.${id}`

              if (field.props.source) {
                newSource = `${newSource}.${field.props.source}`
              }

              return React.cloneElement(field, {
                source: newSource,
                ...rest,
              })
            })

            return (
              <Card
                key={id}
                classes={{
                  root: classes.entry,
                }}
              >
                <CardContent>
                  {keyGenerator ? (
                    childrenToRender
                  ) : (
                    <Labeled label={id}>
                      <div>{childrenToRender}</div>
                    </Labeled>
                  )}

                  <IconButton
                    aria-label="Remove"
                    // eslint-disable-next-line
                    onClick={() => this.onClickRemoveEntryButton(id)}
                    className={classes.removeEntryButton}
                  >
                    <ClearIcon color="error" />
                  </IconButton>
                </CardContent>
              </Card>
            )
          })}

        {!keyGenerator && !(keyChoices && keyChoices.length) ? (
          <Dialog
            open={isDialogOpen}
            onEscapeKeyDown={this.closeDialog}
            onBackdropClick={this.closeDialog}
            onClose={this.closeDialog}
            classes={{
              paper: classes.dialog,
            }}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">New Entry</DialogTitle>

            <DialogContent>
              <TextField
                autoFocus
                error={Boolean(newEntryKeyError)}
                label="Key *"
                helperText={newEntryKeyError || ' '}
                onChange={this.onChangeNewEntryKey}
                margin="dense"
                id="new-entry-key"
                fullWidth
                onKeyPress={this.onTextFieldKeyPress}
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={this.closeDialog} color="primary">
                Cancel
              </Button>
              <Button onClick={this.onSubmitNewEntryKey} color="primary">
                Add
              </Button>
            </DialogActions>
          </Dialog>
        ) : null}

        <Dialog
          open={isRemovingEntryConfirmDialogOpen}
          onEscapeKeyDown={this.closeConfirmDialog}
          onBackdropClick={this.closeConfirmDialog}
          onClose={this.closeConfirmDialog}
          classes={{
            paper: classes.confirmDialog,
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Are you sure?</DialogTitle>

          <DialogActions>
            <Button onClick={this.handleCancelRemovingEntry} color="default">
              CANCEL
            </Button>

            <Button
              onClick={this.handleConfirmRemovingEntry}
              color="secondary"
              autoFocus
            >
              CONFIRM
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }

  componentWillReceiveProps(nextProps) {
    if (
      !this.state.orderedEntries &&
      this.props.value !== nextProps.value &&
      nextProps.value
    ) {
      this.setState({
        orderedEntries: Object.keys(nextProps.value),
      })
    }
  }

  onSelectKeyChoice = eventOrValue => {
    const value = eventOrValue.target ? eventOrValue.target.value : eventOrValue

    if (value) {
      this.setState(state => {
        if (state.orderedEntries && state.orderedEntries.includes(value)) {
          return null
        }

        return {
          orderedEntries: [value].concat(
            state.orderedEntries ? state.orderedEntries : []
          ),
        }
      })
    }
  }

  onAddEntry = () => {
    const { keyGenerator } = this.props

    if (keyGenerator) {
      const newEntryKey = keyGenerator()

      this.setState(state => ({
        orderedEntries: [newEntryKey].concat(
          state.orderedEntries ? state.orderedEntries : []
        ),
      }))
    } else {
      this.setState({ isDialogOpen: true })
    }
  }

  onSubmitNewEntryKey = () => {
    const { validateKey } = this.props
    const { orderedEntries } = this.state
    const { newEntryKey } = this

    let error

    if (!newEntryKey) {
      error = 'Required'
    }

    if (!error && orderedEntries && orderedEntries.includes(newEntryKey)) {
      error = 'Key already exists'
    }

    if (!error && validateKey) {
      for (let i = 0; i < validateKey.length; i++) {
        error = validateKey[i](newEntryKey)

        if (error) {
          break
        }
      }
    }

    if (error) {
      this.setState({
        newEntryKeyError: error,
      })
    } else {
      this.newEntryKey = ''

      this.setState(state => ({
        orderedEntries: [newEntryKey].concat(
          state.orderedEntries ? state.orderedEntries : []
        ),
        newEntryKeyError: '',
        isDialogOpen: false,
      }))
    }
  }

  onTextFieldKeyPress = event => {
    if (event.key === 'Enter') {
      event.preventDefault()

      this.onSubmitNewEntryKey()
    }
  }

  onClickRemoveEntryButton = id => {
    this._pendingEntryToRemove = id

    const { undoable } = this.props

    if (undoable) {
      this.handleConfirmRemovingEntry()
    } else {
      this.setState({ isRemovingEntryConfirmDialogOpen: true })
    }
  }

  handleConfirmRemovingEntry = () => {
    if (this._pendingEntryToRemove) {
      const id = this._pendingEntryToRemove

      this._pendingEntryToRemove = undefined

      this.setState(
        state => ({
          isRemovingEntryConfirmDialogOpen: false,
          orderedEntries: state.orderedEntries.filter(item => item !== id),
        }),
        () => {
          const { form, change, source } = this.props
          const { orderedEntries } = this.state

          if (orderedEntries.length) {
            change(form, `${source}.${id}`, null)
          } else {
            change(form, source, null)
          }
        }
      )
    }
  }

  handleCancelRemovingEntry = () => {
    this._pendingEntryToRemove = undefined

    this.setState({ isRemovingEntryConfirmDialogOpen: false })
  }

  closeDialog = () => this.setState({ isDialogOpen: false })

  closeConfirmDialog = () =>
    this.setState({ isRemovingEntryConfirmDialogOpen: false })

  onChangeNewEntryKey = event => {
    this.newEntryKey = event.target.value
  }
}

function mapStateToProps(state, { form, source }) {
  return {
    value: get(getFormValues(form)(state), source),
  }
}

const EnhancedGroupInput = connect(mapStateToProps, { change })(
  withStyles(styles)(GroupInputView)
)

export default function GroupInput(props) {
  return (
    <FormName>
      {({ form }) => <EnhancedGroupInput {...props} form={form} />}
    </FormName>
  )
}
