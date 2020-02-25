import React, { Component } from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import Chip from '@material-ui/core/Chip'
import { withStyles } from '@material-ui/core/styles'
import compose from 'recompose/compose'
import classnames from 'classnames'
import { addField, translate, FieldTitle } from 'ra-core'
import { DataStructures } from 'react-admin-patch/ra-core'

const sanitizeRestProps = ({
  addLabel,
  allowEmpty,
  basePath,
  choices,
  className,
  component,
  crudGetMatching,
  crudGetOne,
  defaultValue,
  filter,
  filterToQuery,
  formClassName,
  initializeForm,
  input,
  isRequired,
  label,
  limitChoicesToValue,
  locale,
  meta,
  onChange,
  options,
  optionValue,
  optionText,
  perPage,
  record,
  reference,
  resource,
  setFilter,
  setPagination,
  setSort,
  sort,
  source,
  textAlign,
  translate,
  translateChoice,
  validation,
  dataStructure,
  ...rest
}) => rest

const styles = theme => ({
  root: {},
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing.unit / 4,
  },
  select: {
    height: 'auto',
    overflow: 'auto',
  },
  input: {
    minWidth: theme.spacing.unit * 20,
  },
})

/**
 * An Input component for a select box allowing multiple selections, using an array of objects for the options
 *
 * Pass possible options as an array of objects in the 'choices' attribute.
 *
 * By default, the options are built from:
 *  - the 'id' property as the option value,
 *  - the 'name' property an the option text
 * @example
 * const choices = [
 *    { id: 'programming', name: 'Programming' },
 *    { id: 'lifestyle', name: 'Lifestyle' },
 *    { id: 'photography', name: 'Photography' },
 * ];
 * <SelectArrayInput source="tags" choices={choices} />
 *
 * You can also customize the properties to use for the option name and value,
 * thanks to the 'optionText' and 'optionValue' attributes.
 * @example
 * const choices = [
 *    { _id: 123, full_name: 'Leo Tolstoi', sex: 'M' },
 *    { _id: 456, full_name: 'Jane Austen', sex: 'F' },
 * ];
 * <SelectArrayInput source="authors" choices={choices} optionText="full_name" optionValue="_id" />
 *
 * `optionText` also accepts a function, so you can shape the option text at will:
 * @example
 * const choices = [
 *    { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
 *    { id: 456, first_name: 'Jane', last_name: 'Austen' },
 * ];
 * const optionRenderer = choice => `${choice.first_name} ${choice.last_name}`;
 * <SelectArrayInput source="authors" choices={choices} optionText={optionRenderer} />
 *
 * `optionText` also accepts a React Element, that will be cloned and receive
 * the related choice as the `record` prop. You can use Field components there.
 * @example
 * const choices = [
 *    { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
 *    { id: 456, first_name: 'Jane', last_name: 'Austen' },
 * ];
 * const FullNameField = ({ record }) => <span>{record.first_name} {record.last_name}</span>;
 * <SelectArrayInput source="authors" choices={choices} optionText={<FullNameField />}/>
 *
 * The choices are translated by default, so you can use translation identifiers as choices:
 * @example
 * const choices = [
 *    { id: 'programming', name: 'myroot.tags.programming' },
 *    { id: 'lifestyle', name: 'myroot.tags.lifestyle' },
 *    { id: 'photography', name: 'myroot.tags.photography' },
 * ];
 */
export class SelectArrayInput extends Component {
  constructor(props) {
    super(props)

    /*
     * Using state to bypass a redux-form comparison but which prevents re-rendering
     * @see https://github.com/erikras/redux-form/issues/2456
     */
    this.state = {
      value: this.getStateValue(this.props.input.value),
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.input.value !== this.props.input.value) {
      const transformedValue = this.getStateValue(nextProps.input.value)

      this.setState({ value: transformedValue })
    }
  }

  handleChange = event => {
    const arrayValue = event.target.value

    const value = arrayValue && arrayValue.length ? arrayValue : null

    const transformedValue = this.maybeTransformNewValue(value)

    this.props.input.onChange(transformedValue)
    // HACK: For some reason, redux-form does not consider this input touched without calling onBlur manually
    this.props.input.onBlur(transformedValue)
    this.setState({ value: arrayValue })
  }

  getStateValue = inputValue => {
    if (Array.isArray(inputValue)) {
      return inputValue
    }

    const { dataStructure } = this.props

    if (inputValue) {
      if (dataStructure === DataStructures.REFERENCE_BOOLEAN_MAP) {
        return Object.keys(inputValue)
      }

      if (dataStructure === DataStructures.REFERENCE_NUMBER_MAP) {
        const orderedIds = []
        const tail = []

        Object.keys(inputValue).forEach(id => {
          const correspondingIdNumberValue = inputValue[id]

          if (
            Number.isInteger(correspondingIdNumberValue) &&
            !orderedIds[correspondingIdNumberValue - 1]
          ) {
            orderedIds[correspondingIdNumberValue - 1] = id
          } else {
            tail.push(id)
          }
        })

        return orderedIds.concat(tail)
      }
    }

    return []
  }

  maybeTransformNewValue = value => {
    if (value) {
      const { dataStructure } = this.props

      switch (dataStructure) {
        case DataStructures.REFERENCE_BOOLEAN_MAP:
          return value.reduce(function(out, id) {
            out[id] = true

            return out
          }, {})

        case DataStructures.REFERENCE_NUMBER_MAP:
          return value.reduce(function(out, id, index) {
            out[id] = index + 1

            return out
          }, {})

        default:
          return value
      }
    }

    return value
  }

  renderMenuItemOption = choice => {
    const { optionText, translate, translateChoice } = this.props

    if (React.isValidElement(optionText)) {
      return React.cloneElement(optionText, {
        record: choice,
      })
    }

    const choiceName =
      typeof optionText === 'function'
        ? optionText(choice)
        : get(choice, optionText)

    return translateChoice
      ? translate(choiceName, { _: choiceName })
      : choiceName
  }

  renderMenuItem = choice => {
    const { optionValue } = this.props

    return (
      <MenuItem key={get(choice, optionValue)} value={get(choice, optionValue)}>
        {this.renderMenuItemOption(choice)}
      </MenuItem>
    )
  }

  render() {
    const {
      choices,
      classes,
      className,
      isRequired,
      label,
      meta,
      options,
      resource,
      source,
      optionText,
      optionValue,
      ...rest
    } = this.props

    // console.info('choices: ', JSON.stringify(choices, null, 4))

    if (typeof meta === 'undefined') {
      throw new Error(
        "The SelectInput component wasn't called within a redux-form <Field>. Did you decorate it and forget to add the addField prop to your component? See https://marmelab.com/react-admin/Inputs.html#writing-your-own-input-component for details."
      )
    }

    const { touched, error, helperText = false } = meta

    return (
      <FormControl
        margin="normal"
        className={classnames(classes.root, classes.input, className)}
        error={Boolean(touched && error)}
        {...sanitizeRestProps(rest)}
      >
        <InputLabel htmlFor={source}>
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </InputLabel>
        <Select
          autoWidth
          multiple
          input={<Input id={source} />}
          value={this.state.value}
          error={Boolean(touched && error)}
          // eslint-disable-next-line
          renderValue={selected =>
            selected && (
              <div className={classes.chips}>
                {selected
                  .map(item =>
                    choices.find(choice => choice[optionValue] === item)
                  )
                  .map(
                    item =>
                      item && (
                        <Chip
                          key={get(item, optionValue)}
                          label={this.renderMenuItemOption(item)}
                          className={classes.chip}
                        />
                      )
                  )}
              </div>
            )
          }
          {...options}
          onChange={this.handleChange}
        >
          {choices.map(this.renderMenuItem)}
        </Select>
        {touched && error && <FormHelperText error>{error}</FormHelperText>}
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    )
  }
}

SelectArrayInput.propTypes = {
  choices: PropTypes.arrayOf(PropTypes.object),
  classes: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.node,
  input: PropTypes.object,
  isRequired: PropTypes.bool,
  label: PropTypes.string,
  meta: PropTypes.object,
  options: PropTypes.object,
  optionText: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.element,
  ]).isRequired,
  optionValue: PropTypes.string.isRequired,
  resource: PropTypes.string,
  source: PropTypes.string,
  translate: PropTypes.func.isRequired,
  translateChoice: PropTypes.bool,
  dataStructure: PropTypes.string,
}

SelectArrayInput.defaultProps = {
  classes: {},
  choices: [],
  options: {},
  optionText: 'name',
  optionValue: 'id',
  translateChoice: true,
  dataStructure: DataStructures.REFERENCE_LIST,
}

const EnhancedSelectArrayInput = compose(
  addField,
  translate,
  withStyles(styles)
)(SelectArrayInput)

export default EnhancedSelectArrayInput
