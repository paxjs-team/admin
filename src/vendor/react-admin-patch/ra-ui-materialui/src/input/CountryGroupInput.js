import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'

import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'

import { withStyles } from '@material-ui/core/styles'

import { chunk } from 'lodash'
import { FieldTitle, addField } from 'react-admin'

import AddIcon from '@material-ui/icons/Add'

import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'

import CountryIcon from './LocalizedInput/CountryIcon'

import countries from 'i18n-iso-countries'

countries.registerLocale(require('i18n-iso-countries/langs/en.json'))
const englishCountryNames = countries.getNames('en')

const choices = Object.keys(englishCountryNames).map(countryCode => ({
  id: countryCode,
  name: englishCountryNames[countryCode],
}))

const styles = {
  container: {
    marginTop: 25,
    marginBottom: 25,
  },

  button: {
    margin: 10,
  },

  countryListFormControl: {
    display: 'flex',
  },

  dialog: {
    minWidth: 450,
  },

  countryIcon: {
    marginRight: 10,
    fontSize: 20,
  },

  suggestedCountriesGroup: {
    marginRight: 20,
  },

  footer: {
    marginTop: 10,
  },

  addMoreButton: {
    fontSize: '0.8125rem',
    minWidth: 150,
  },

  addButtonIcon: {
    fontSize: '20px',
  },

  addButtonTitle: {
    marginTop: 1,
  },

  errorText: {
    color: '#f44336',
  },

  title: {
    marginBottom: 10,
  },
}

class CountryGroupInput extends Component {
  static propTypes = {
    label: PropTypes.string,
    source: PropTypes.string,
    record: PropTypes.object,
    classes: PropTypes.object,
    resource: PropTypes.string,
    isRequired: PropTypes.bool,
    dispatch: PropTypes.func,
    suggestedCountries: PropTypes.array,
    input: PropTypes.object,
    meta: PropTypes.object,
  }

  state = {
    isDialogOpen: false,
  }

  render() {
    const {
      isRequired,
      label,
      resource,
      source,
      suggestedCountries,
      classes,
      input,
      meta,
    } = this.props
    const { isDialogOpen } = this.state
    const { touched, error } = meta

    const withErrors = Boolean(touched && error)

    const totalSelected = input.value.split(',').filter(item => item !== '')
      .length

    return (
      <div className={classes.container}>
        <div
          className={`${classes.title} ${
            withErrors ? classes.errorText : null
          }`}
        >
          <FieldTitle
            label={label + ` (${totalSelected})`}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </div>

        {suggestedCountries &&
          chunk(suggestedCountries, 5).map((suggestedCountriesGroup, index) => (
            <FormControl
              key={index}
              className={classes.suggestedCountriesGroup}
            >
              <FormGroup>
                {suggestedCountriesGroup.map(countryCode => (
                  <FormControlLabel
                    key={countryCode}
                    control={
                      <Checkbox
                        checked={input.value.includes(countryCode)}
                        onChange={this._onToggleCountry}
                        value={countryCode}
                      />
                    }
                    label={
                      <span>
                        <CountryIcon
                          countryCode={countryCode}
                          className={classes.countryIcon}
                        />

                        {englishCountryNames[countryCode]}
                      </span>
                    }
                  />
                ))}
              </FormGroup>
            </FormControl>
          ))}

        <div className={classes.footer}>
          <Button
            color="primary"
            onClick={this._toggleDialog}
            className={classes.addMoreButton}
            variant="outlined"
          >
            <AddIcon
              classes={{
                root: classes.addButtonIcon,
              }}
            />
            {'  '}
            <span className={classes.addButtonTitle}>More</span>
          </Button>
        </div>

        {withErrors && <FormHelperText error>{error}</FormHelperText>}

        <Dialog
          open={isDialogOpen}
          onEscapeKeyDown={this._toggleDialog}
          onBackdropClick={this._toggleDialog}
          classes={{
            paper: classes.dialog,
          }}
        >
          <DialogTitle>Select Countries</DialogTitle>

          <DialogContent dividers="true">
            {choices.map(choice => (
              <FormControlLabel
                key={choice.id}
                label={choice.name}
                className={classes.countryListFormControl}
                control={
                  <Checkbox
                    checked={input.value.includes(choice.id)}
                    onChange={this._onToggleCountry}
                    value={choice.id}
                  />
                }
              />
            ))}
          </DialogContent>

          <DialogActions>
            <Button
              color="primary"
              className={classes.button}
              onClick={this._selectAllCountries}
            >
              Select All
            </Button>

            <Button
              color="secondary"
              className={classes.button}
              onClick={this._removeAllCountries}
            >
              Remove All
            </Button>

            <Button
              color="primary"
              className={classes.button}
              onClick={this._toggleDialog}
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }

  _toggleDialog = () =>
    this.setState(state => ({ isDialogOpen: !state.isDialogOpen }))

  _onToggleCountry = (eventOrValue, isChecked) => {
    const countryCode = eventOrValue.target
      ? eventOrValue.target.value
      : eventOrValue

    const { input, meta } = this.props

    const nextValue = isChecked
      ? input.value
          .split(',')
          .filter(item => item !== '')
          .concat([countryCode])
          .toString()
      : input.value
          .split(',')
          .filter(item => item !== '' && item !== countryCode)
          .toString()

    input.onChange(nextValue)

    if (!meta.touched) {
      input.onBlur(nextValue)
    }
  }

  _selectAllCountries = () => {
    const nextValue = choices.map(item => item.id).toString()

    this.props.input.onChange(nextValue)
  }

  _removeAllCountries = () => {
    const nextValue = ''

    this.props.input.onChange(nextValue)
  }
}

export default addField(withStyles(styles)(CountryGroupInput))
