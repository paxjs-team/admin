import React from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import isEqual from 'lodash/isEqual'
import omit from 'lodash/omit'
import isEmpty from 'lodash/isEmpty'
import max from 'lodash/max'
import keys from 'lodash/keys'
import Autosuggest from 'react-autosuggest'
import Chip from '@material-ui/core/Chip'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import MenuItem from '@material-ui/core/MenuItem'
import { withStyles, createStyles } from '@material-ui/core/styles'
import parse from 'autosuggest-highlight/parse'
import match from 'autosuggest-highlight/match'
import blue from '@material-ui/core/colors/blue'
import compose from 'recompose/compose'
import classNames from 'classnames'

import { addField, translate, FieldTitle } from 'ra-core'
import { DataStructures } from 'react-admin-patch/ra-core'

import AutocompleteArrayInputChip from 'ra-ui-materialui/lib/input/AutocompleteArrayInputChip'

const styles = theme =>
  createStyles({
    container: {
      flexGrow: 1,
      position: 'relative',
    },
    root: {},
    suggestionsContainerOpen: {
      position: 'absolute',
      marginBottom: theme.spacing.unit * 3,
      zIndex: 2,
    },
    suggestionsPaper: {
      maxHeight: '50vh',
      overflowY: 'auto',
    },
    suggestion: {
      display: 'block',
      fontFamily: theme.typography.fontFamily,
    },
    suggestionText: { fontWeight: 300 },
    highlightedSuggestionText: { fontWeight: 500 },
    suggestionsList: {
      margin: 0,
      padding: 0,
      listStyleType: 'none',
    },
    chip: {
      marginRight: theme.spacing.unit,
      marginTop: theme.spacing.unit,
    },
    chipDisabled: {
      pointerEvents: 'none',
    },
    chipFocused: {
      backgroundColor: blue[300],
    },
  })

/**
 * An Input component for an autocomplete field, using an array of objects for the options
 *
 * Pass possible options as an array of objects in the 'choices' attribute.
 *
 * By default, the options are built from:
 *  - the 'id' property as the option value,
 *  - the 'name' property an the option text
 * @example
 * const choices = [
 *    { id: 'M', name: 'Male' },
 *    { id: 'F', name: 'Female' },
 * ];
 * <AutocompleteInput source="gender" choices={choices} />
 *
 * You can also customize the properties to use for the option name and value,
 * thanks to the 'optionText' and 'optionValue' attributes.
 * @example
 * const choices = [
 *    { _id: 123, full_name: 'Leo Tolstoi', sex: 'M' },
 *    { _id: 456, full_name: 'Jane Austen', sex: 'F' },
 * ];
 * <AutocompleteInput source="author_id" choices={choices} optionText="full_name" optionValue="_id" />
 *
 * `optionText` also accepts a function, so you can shape the option text at will:
 * @example
 * const choices = [
 *    { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
 *    { id: 456, first_name: 'Jane', last_name: 'Austen' },
 * ];
 * const optionRenderer = choice => `${choice.first_name} ${choice.last_name}`;
 * <AutocompleteInput source="author_id" choices={choices} optionText={optionRenderer} />
 *
 * The choices are translated by default, so you can use translation identifiers as choices:
 * @example
 * const choices = [
 *    { id: 'M', name: 'myroot.gender.male' },
 *    { id: 'F', name: 'myroot.gender.female' },
 * ];
 *
 * However, in some cases (e.g. inside a `<ReferenceInput>`), you may not want
 * the choice to be translated. In that case, set the `translateChoice` prop to false.
 * @example
 * <AutocompleteInput source="gender" choices={choices} translateChoice={false}/>
 *
 * The object passed as `options` props is passed to the material-ui <AutoComplete> component
 *
 * @example
 * <AutocompleteInput source="author_id" options={{ fullWidth: true }} />
 */

export class AutocompleteManyInput extends React.Component {
  initialFormattedValue = []
  initialInputValue =
    this.props.dataStructure === DataStructures.REFERENCE_LIST ? [] : {}

  state = {
    dirty: false,
    inputValue: null,
    searchText: '',
    suggestions: [],
  }

  inputEl = null
  anchorEl = null

  getInputValue = inputValue => {
    if (inputValue === '') {
      this.lastFormattedValue = this.initialFormattedValue

      return this.initialInputValue
    }

    const { dataStructure } = this.props

    switch (dataStructure) {
      case DataStructures.REFERENCE_LIST:
        this.lastFormattedValue = inputValue
        break

      case DataStructures.REFERENCE_BOOLEAN_MAP:
        this.lastFormattedValue = Object.keys(inputValue)
        break

      case DataStructures.REFERENCE_NUMBER_MAP:
        this.lastFormattedValue = getSortedKeysByNumericValue(inputValue)
        break

      default:
        this.lastFormattedValue = inputValue
    }

    return inputValue
  }

  getSuggestions = (inputValue, choices) => {
    const { dataStructure, hideSelectedSuggestions } = this.props

    if (!hideSelectedSuggestions) {
      return choices
    }

    let selectedIds

    switch (dataStructure) {
      case DataStructures.REFERENCE_BOOLEAN_MAP:
      case DataStructures.REFERENCE_NUMBER_MAP:
      case DataStructures.REFERENCE_RECORD_MAP:
        selectedIds = keys(inputValue)
        break

      case DataStructures.REFERENCE_LIST:
        selectedIds = inputValue || []
        break

      default:
        selectedIds = []
    }

    if (selectedIds.length) {
      return choices.filter(item => selectedIds.indexOf(item.id) === -1)
    }

    return choices
  }

  componentWillMount() {
    const { choices } = this.props
    const { value } = this.props.input

    this.setState({
      inputValue: this.getInputValue(value),
      suggestions: this.getSuggestions(value, choices),
    })
  }

  componentWillReceiveProps(nextProps) {
    const { choices, input, inputValueMatcher } = nextProps

    if (this.props.input.value !== input.value) {
      this.getInputValue(input.value)
    }

    if (!isEqual(this.getInputValue(input.value), this.state.inputValue)) {
      this.setState({
        inputValue: this.getInputValue(input.value),
        dirty: false,
        suggestions: this.getSuggestions(input.value, choices),
      })
      // Ensure to reset the filter
      this.updateFilter('', input.value)
    } else if (!isEqual(choices, this.props.choices)) {
      this.setState(({ searchText }) => ({
        suggestions: this.getSuggestions(
          input.value,
          choices
        ).filter(suggestion =>
          inputValueMatcher(searchText, suggestion, this.getSuggestionText)
        ),
      }))
    }
  }

  getSuggestionValue = suggestion => get(suggestion, this.props.optionValue)

  getSuggestionText = suggestion => {
    if (!suggestion) {
      return ''
    }

    const { optionText, translate, translateChoice } = this.props
    const suggestionLabel =
      typeof optionText === 'function'
        ? optionText(suggestion)
        : get(suggestion, optionText)

    // We explicitly call toString here because AutoSuggest expect a string
    return translateChoice
      ? translate(suggestionLabel, { _: suggestionLabel }).toString()
      : suggestionLabel.toString()
  }

  handleSuggestionSelected = (event, { suggestion, method }) => {
    const { input } = this.props

    const choiceValue = this.getSuggestionValue(suggestion)

    if (this.isChoiceValueSelected(this.state.inputValue, choiceValue)) {
      return
    }

    const newValue = this.addSuggestionValueToCurrent(
      this.state.inputValue,
      choiceValue
    )

    input.onChange(newValue)

    if (method === 'enter') {
      event.preventDefault()
    }
  }

  handleSuggestionsFetchRequested = () => {
    const { choices, input, inputValueMatcher } = this.props

    this.setState(({ searchText }) => ({
      suggestions: this.getSuggestions(
        input.value,
        choices
      ).filter(suggestion =>
        inputValueMatcher(searchText, suggestion, this.getSuggestionText)
      ),
    }))
  }

  handleSuggestionsClearRequested = () => {
    this.updateFilter('')
  }

  handleMatchSuggestionOrFilter = inputValue => {
    this.setState({
      dirty: true,
      searchText: inputValue,
    })
    this.updateFilter(inputValue)
  }

  handleChange = (event, { newValue, method }) => {
    if (method === 'type' || method === 'escape') {
      this.handleMatchSuggestionOrFilter(newValue)
    }
  }

  renderInput = inputProps => {
    const {
      autoFocus,
      className,
      classes,
      isRequired,
      label,
      meta,
      onChange,
      resource,
      source,
      value,
      ref,
      options: { InputProps, suggestionsContainerProps, ...options },
      ...other
    } = inputProps

    if (typeof meta === 'undefined') {
      throw new Error(
        "The TextInput component wasn't called within a redux-form <Field>. Did you decorate it and forget to add the addField prop to your component? See https://marmelab.com/react-admin/Inputs.html#writing-your-own-input-component for details."
      )
    }

    const { touched, error, helperText = false } = meta

    // We need to store the input reference for our Popper element containg the suggestions
    // but Autosuggest also needs this reference (it provides the ref prop)
    const storeInputRef = input => {
      this.inputEl = input
      this.updateAnchorEl()
      ref(input)
    }

    return (
      <AutocompleteArrayInputChip
        clearInputValueOnChange
        onUpdateInput={onChange}
        onAdd={this.handleAdd}
        onDelete={this.handleDelete}
        value={this.lastFormattedValue}
        // eslint-disable-next-line
        inputRef={storeInputRef}
        error={touched && error}
        helperText={touched && error && helperText}
        chipRenderer={this.renderChip}
        label={
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        }
        {...other}
        {...options}
      />
    )
  }

  renderChip = (
    { value, isFocused, isDisabled, handleClick, handleDelete },
    key
  ) => {
    const { classes = {}, choices, hideSelectedValues } = this.props

    if (hideSelectedValues) {
      return null
    }

    const suggestion = choices.find(
      choice => this.getSuggestionValue(choice) === value
    )

    return (
      <Chip
        key={key}
        className={classNames(classes.chip, {
          [classes.chipDisabled]: isDisabled,
          [classes.chipFocused]: isFocused,
        })}
        onClick={handleClick}
        onDelete={handleDelete}
        label={this.getSuggestionText(suggestion)}
      />
    )
  }

  handleAdd = chip => {
    const {
      choices,
      input,
      limitChoicesToValue,
      inputValueMatcher,
    } = this.props

    const filteredChoices = choices.filter(choice =>
      inputValueMatcher(chip, choice, this.getSuggestionText)
    )

    let choice =
      filteredChoices.length === 1
        ? filteredChoices[0]
        : filteredChoices.find(c => this.getSuggestionValue(c) === chip)

    if (choice === undefined) {
      choice = filteredChoices[0]
    }

    if (choice) {
      const choiceValue = this.getSuggestionValue(choice)

      if (this.isChoiceValueSelected(this.state.inputValue, choiceValue)) {
        this.setState(
          {
            suggestions: this.getSuggestions(input.value, this.props.choices),
          },
          () => this.updateFilter('')
        )

        return
      }

      const newValue = this.addSuggestionValueToCurrent(
        this.state.inputValue,
        choiceValue
      )

      return input.onChange(newValue)
    }

    if (limitChoicesToValue) {
      // Ensure to reset the filter
      this.updateFilter('')

      return
    }

    const newValue = this.addSuggestionValueToCurrent(
      this.state.inputValue,
      chip
    )

    input.onChange(newValue)
  }

  handleDelete = chip => {
    const { input } = this.props

    const newValue = this.removeSuggesionValueFromCurrent(
      this.state.inputValue,
      chip
    )

    input.onChange(newValue)
  }

  removeSuggesionValueFromCurrent = (currentValue, removedSuggestionValue) => {
    if (currentValue && removedSuggestionValue) {
      const { dataStructure } = this.props

      switch (dataStructure) {
        case DataStructures.REFERENCE_LIST: {
          const newValue = currentValue.filter(
            item => item !== removedSuggestionValue
          )

          this.lastFormattedValue = newValue

          return newValue.length ? newValue : null
        }

        case DataStructures.REFERENCE_BOOLEAN_MAP: {
          const newValue = omit(currentValue, [removedSuggestionValue])

          if (isEmpty(newValue)) {
            this.lastFormattedValue = []

            return null
          }

          this.lastFormattedValue = Object.keys(newValue)

          return newValue
        }

        case DataStructures.REFERENCE_NUMBER_MAP: {
          const valueWithoutRemovedChoice = omit(currentValue, [
            removedSuggestionValue,
          ])

          this.lastFormattedValue = getSortedKeysByNumericValue(
            valueWithoutRemovedChoice
          )

          return this.lastFormattedValue.length
            ? this.lastFormattedValue.reduce(function(out, id, index) {
                out[id] = index + 1

                return out
              }, {})
            : null
        }

        default:
          return null
      }
    }

    return null
  }

  addSuggestionValueToCurrent = (currentValue, selectedSuggestionValue) => {
    if (selectedSuggestionValue) {
      const { dataStructure } = this.props

      switch (dataStructure) {
        case DataStructures.REFERENCE_LIST: {
          const newValue = [
            ...(currentValue ? currentValue : []),
            selectedSuggestionValue,
          ]

          this.lastFormattedValue = newValue

          return newValue
        }

        case DataStructures.REFERENCE_BOOLEAN_MAP: {
          const newValue = {
            ...(currentValue ? currentValue : {}),
            [selectedSuggestionValue]: true,
          }

          this.lastFormattedValue = Object.keys(newValue)

          return newValue
        }

        case DataStructures.REFERENCE_NUMBER_MAP: {
          let newValue

          if (!currentValue) {
            newValue = {
              [selectedSuggestionValue]: 1,
            }
          } else {
            const currentValuesIndices = Object.values(currentValue)

            if (!currentValuesIndices.length) {
              newValue = {
                [selectedSuggestionValue]: 1,
              }
            } else {
              const maxIndex = max(currentValuesIndices)

              newValue = {
                ...currentValue,
                [selectedSuggestionValue]: maxIndex + 1,
              }
            }
          }

          this.lastFormattedValue = getSortedKeysByNumericValue(newValue)

          return newValue
        }

        default:
          return null
      }
    }

    return null
  }

  isChoiceValueSelected = (currentValue, choiceValue) => {
    if (!currentValue) {
      return false
    }

    const { dataStructure } = this.props

    switch (dataStructure) {
      case DataStructures.REFERENCE_LIST:
        return currentValue.includes(choiceValue)

      case DataStructures.REFERENCE_BOOLEAN_MAP:
      case DataStructures.REFERENCE_NUMBER_MAP:
        return currentValue[choiceValue] || false

      default:
        return false
    }
  }

  updateAnchorEl() {
    if (!this.inputEl) {
      return
    }

    const inputPosition = this.inputEl.getBoundingClientRect()

    if (!this.anchorEl) {
      const nextPosition = {
        x: inputPosition.x,
        left: inputPosition.left,
        bottom: inputPosition.bottom,
        width: inputPosition.width,
        height: inputPosition.height,
        right: inputPosition.right,
        top: inputPosition.top + document.body.scrollTop,
        y: inputPosition.y + document.body.scrollTop,
      }

      this.anchorEl = { getBoundingClientRect: () => nextPosition }
    } else {
      const anchorPosition = this.anchorEl.getBoundingClientRect()

      const nextPosition = {
        x: inputPosition.x,
        left: inputPosition.left,
        bottom: inputPosition.bottom,
        width: inputPosition.width,
        height: inputPosition.height,
        right: inputPosition.right,
        top: inputPosition.top + document.body.scrollTop,
        y: inputPosition.y + document.body.scrollTop,
      }

      if (
        anchorPosition.x !== inputPosition.x ||
        anchorPosition.y !== inputPosition.y
      ) {
        this.anchorEl = { getBoundingClientRect: () => nextPosition }
      }
    }
  }

  renderSuggestionsContainer = autosuggestOptions => {
    const {
      containerProps: { className, ...containerProps },
      children,
    } = autosuggestOptions
    const { classes = {}, options } = this.props

    // Force the Popper component to reposition the popup only when this.inputEl is moved to another location
    this.updateAnchorEl()

    return (
      <Popper
        className={className}
        open={Boolean(children)}
        anchorEl={this.anchorEl}
        placement="top-start"
        {...options.suggestionsContainerProps}
      >
        <Paper square className={classes.suggestionsPaper} {...containerProps}>
          {children}
        </Paper>
      </Popper>
    )
  }

  renderSuggestionComponent = ({
    suggestion,
    query,
    isHighlighted,
    ...props
  }) => <div {...props} />

  renderSuggestion = (suggestion, { query, isHighlighted }) => {
    const label = this.getSuggestionText(suggestion)
    const matches = match(label, query)
    const parts = parse(label, matches)
    const { classes = {}, suggestionComponent } = this.props

    return (
      <MenuItem
        selected={isHighlighted}
        component={suggestionComponent || this.renderSuggestionComponent}
        suggestion={suggestion}
        query={query}
        isHighlighted={isHighlighted}
      >
        <div>
          {parts.map((part, index) =>
            part.highlight ? (
              <span key={index} className={classes.highlightedSuggestionText}>
                {part.text}
              </span>
            ) : (
              <strong key={index} className={classes.suggestionText}>
                {part.text}
              </strong>
            )
          )}
        </div>
      </MenuItem>
    )
  }

  handleFocus = () => {
    const { input } = this.props

    input && input.onFocus && input.onFocus()
  }

  updateFilter = (value, inputValues) => {
    const { setFilter } = this.props

    // hack for calling this method in componentWillReceiveProps (should be replaced with componentDidUpdate)
    const selectedValues = inputValues || this.props.input.value

    const choices = this.getSuggestions(selectedValues, this.props.choices)

    if (this.previousFilterValue !== value) {
      if (setFilter) {
        this.setState({ searchText: value }, () => setFilter(value))
      } else {
        this.setState({
          searchText: value,
          suggestions:
            value === ''
              ? choices
              : choices.filter(choice =>
                  this.getSuggestionText(choice)
                    .toLowerCase()
                    .includes(value.toLowerCase())
                ),
        })
      }
    }
    this.previousFilterValue = value
  }

  shouldRenderSuggestions = val => {
    const { shouldRenderSuggestions } = this.props

    if (
      shouldRenderSuggestions !== undefined &&
      typeof shouldRenderSuggestions === 'function'
    ) {
      return shouldRenderSuggestions(val)
    }

    return true
  }

  render() {
    const {
      alwaysRenderSuggestions,
      classes = {},
      isRequired,
      label,
      meta,
      resource,
      source,
      className,
      options,
    } = this.props
    const { suggestions, searchText } = this.state

    return (
      <Autosuggest
        theme={{
          container: classes.container,
          suggestionsContainerOpen: classes.suggestionsContainerOpen,
          suggestionsList: classes.suggestionsList,
          suggestion: classes.suggestion,
        }}
        renderInputComponent={this.renderInput}
        suggestions={suggestions}
        alwaysRenderSuggestions={alwaysRenderSuggestions}
        onSuggestionSelected={this.handleSuggestionSelected}
        onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
        renderSuggestionsContainer={this.renderSuggestionsContainer}
        getSuggestionValue={this.getSuggestionText}
        renderSuggestion={this.renderSuggestion}
        shouldRenderSuggestions={this.shouldRenderSuggestions}
        inputProps={{
          blurBehavior: 'add',
          className,
          classes,
          isRequired,
          label,
          meta,
          onChange: this.handleChange,
          resource,
          source,
          value: searchText,
          onFocus: this.handleFocus,
          options,
        }}
      />
    )
  }
}

AutocompleteManyInput.propTypes = {
  allowEmpty: PropTypes.bool,
  alwaysRenderSuggestions: PropTypes.bool, // used only for unit tests
  choices: PropTypes.arrayOf(PropTypes.object),
  classes: PropTypes.object,
  className: PropTypes.string,
  InputProps: PropTypes.object,
  input: PropTypes.object,
  inputValueMatcher: PropTypes.func,
  isRequired: PropTypes.bool,
  label: PropTypes.string,
  limitChoicesToValue: PropTypes.bool,
  meta: PropTypes.object,
  options: PropTypes.object,
  optionText: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
    .isRequired,
  optionValue: PropTypes.string.isRequired,
  resource: PropTypes.string,
  setFilter: PropTypes.func,
  shouldRenderSuggestions: PropTypes.func,
  source: PropTypes.string,
  suggestionComponent: PropTypes.func,
  translate: PropTypes.func.isRequired,
  translateChoice: PropTypes.bool.isRequired,
  dataStructure: PropTypes.string.isRequired,
  hideSelectedValues: PropTypes.bool,
  hideSelectedSuggestions: PropTypes.bool,
}

AutocompleteManyInput.defaultProps = {
  choices: [],
  options: {
    suggestionsContainerProps: {
      modifiers: {
        keepTogether: {
          enabled: true,
        },
        flip: {
          enabled: true,
        },
        preventOverflow: {
          enabled: true,
          boundariesElement: 'scrollParent',
        },
      },
    },
  },
  optionText: 'name',
  optionValue: 'id',
  limitChoicesToValue: false,
  translateChoice: true,
  inputValueMatcher: (input, suggestion, getOptionText) =>
    getOptionText(suggestion)
      .toLowerCase()
      .trim()
      .includes(input.toLowerCase().trim()),
  dataStructure: DataStructures.REFERENCE_LIST,
}

export default compose(
  addField,
  translate,
  withStyles(styles)
)(AutocompleteManyInput)

function getSortedKeysByNumericValue(numericMap) {
  if (!numericMap) {
    return []
  }

  return Object.keys(numericMap)
    .map(key => [key, numericMap[key]])
    .sort((a, b) => a[1] - b[1])
    .map(item => item[0])
}
