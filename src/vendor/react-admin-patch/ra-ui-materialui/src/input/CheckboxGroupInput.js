import React, { Component } from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Checkbox from '@material-ui/core/Checkbox'
import { withStyles } from '@material-ui/core/styles'
import compose from 'recompose/compose'
import { addField, translate, FieldTitle } from 'ra-core'
import { DataStructures } from 'react-admin-patch/ra-core'

import defaultSanitizeRestProps from 'ra-ui-materialui/lib/input/sanitizeRestProps'
const sanitizeRestProps = ({ setFilter, setPagination, setSort, ...rest }) =>
  defaultSanitizeRestProps(rest)

const styles = theme => ({
  root: {},
  label: {
    transform: 'translate(0, 1.5px) scale(0.75)',
    transformOrigin: `top ${theme.direction === 'ltr' ? 'left' : 'right'}`,
  },
  checkbox: {
    height: 32,
  },
})

/**
 * An Input component for a checkbox group, using an array of objects for the options
 *
 * Pass possible options as an array of objects in the 'choices' attribute.
 *
 * The expected input must be an array of identifiers (e.g. [12, 31]) which correspond to
 * the 'optionValue' of 'choices' attribute objects.
 *
 * By default, the options are built from:
 *  - the 'id' property as the option value,
 *  - the 'name' property an the option text
 * @example
 * const choices = [
 *     { id: 12, name: 'Ray Hakt' },
 *     { id: 31, name: 'Ann Gullar' },
 *     { id: 42, name: 'Sean Phonee' },
 * ];
 * <CheckboxGroupInput source="recipients" choices={choices} />
 *
 * You can also customize the properties to use for the option name and value,
 * thanks to the 'optionText' and 'optionValue' attributes.
 * @example
 * const choices = [
 *    { _id: 123, full_name: 'Leo Tolstoi' },
 *    { _id: 456, full_name: 'Jane Austen' },
 * ];
 * <CheckboxGroupInput source="recipients" choices={choices} optionText="full_name" optionValue="_id" />
 *
 * `optionText` also accepts a function, so you can shape the option text at will:
 * @example
 * const choices = [
 *    { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
 *    { id: 456, first_name: 'Jane', last_name: 'Austen' },
 * ];
 * const optionRenderer = choice => `${choice.first_name} ${choice.last_name}`;
 * <CheckboxGroupInput source="recipients" choices={choices} optionText={optionRenderer} />
 *
 * `optionText` also accepts a React Element, that will be cloned and receive
 * the related choice as the `record` prop. You can use Field components there.
 * @example
 * const choices = [
 *    { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
 *    { id: 456, first_name: 'Jane', last_name: 'Austen' },
 * ];
 * const FullNameField = ({ record }) => <span>{record.first_name} {record.last_name}</span>;
 * <CheckboxGroupInput source="recipients" choices={choices} optionText={<FullNameField />}/>
 *
 * The choices are translated by default, so you can use translation identifiers as choices:
 * @example
 * const choices = [
 *    { id: 'programming', name: 'myroot.category.programming' },
 *    { id: 'lifestyle', name: 'myroot.category.lifestyle' },
 *    { id: 'photography', name: 'myroot.category.photography' },
 * ];
 *
 * However, in some cases (e.g. inside a `<ReferenceInput>`), you may not want
 * the choice to be translated. In that case, set the `translateChoice` prop to false.
 * @example
 * <CheckboxGroupInput source="gender" choices={choices} translateChoice={false}/>
 *
 * The object passed as `options` props is passed to the material-ui <Checkbox> components
 */
export class CheckboxGroupInput extends Component {
  handleCheck = (event, isChecked) => {
    const { input, dataStructure } = this.props
    let newValue

    try {
      // try to convert string value to number, e.g. '123'
      newValue = JSON.parse(event.target.value)
    } catch (e) {
      // impossible to convert value, e.g. 'abc'
      newValue = event.target.value
    }

    if (dataStructure === DataStructures.REFERENCE_LIST) {
      if (isChecked) {
        input.onChange([...(input.value || []), ...[newValue]])
      } else {
        input.onChange(input.value.filter(v => v !== newValue))
      }
    } else if (dataStructure === DataStructures.REFERENCE_BOOLEAN_MAP) {
      if (isChecked) {
        input.onChange({
          ...(input.value ? input.value : {}),
          [newValue]: true,
        })
      } else {
        input.onChange({
          ...(input.value ? input.value : {}),
          [newValue]: null,
        })
      }
    }
  }

  renderCheckbox = choice => {
    const {
      id,
      input,
      optionText,
      optionValue,
      options,
      translate,
      translateChoice,
      classes,
      dataStructure,
    } = this.props
    const choiceName = React.isValidElement(optionText) // eslint-disable-line no-nested-ternary
      ? React.cloneElement(optionText, { record: choice })
      : typeof optionText === 'function'
      ? optionText(choice)
      : get(choice, optionText)

    const checkboxValue = get(choice, optionValue)

    let checked

    if (dataStructure === DataStructures.REFERENCE_LIST) {
      checked = input.value
        ? input.value.find(v => v === checkboxValue) !== undefined
        : false
    } else if (dataStructure === DataStructures.REFERENCE_BOOLEAN_MAP) {
      checked = input.value ? input.value[checkboxValue] === true : false
    }

    return (
      <FormControlLabel
        htmlFor={`${id}_${checkboxValue}`}
        key={checkboxValue}
        checked={checked}
        onChange={this.handleCheck}
        value={String(checkboxValue)}
        control={
          <Checkbox
            id={`${id}_${checkboxValue}`}
            color="primary"
            className={classes.checkbox}
            {...options}
          />
        }
        label={
          translateChoice
            ? translate(choiceName, { _: choiceName })
            : choiceName
        }
      />
    )
  }

  render() {
    const {
      choices,
      className,
      classes = {},
      isRequired,
      label,
      meta,
      resource,
      source,
      input,
      dataStructure,
      ...rest
    } = this.props

    if (typeof meta === 'undefined') {
      throw new Error(
        "The CheckboxGroupInput component wasn't called within a redux-form <Field>. Did you decorate it and forget to add the addField prop to your component? See https://marmelab.com/react-admin/Inputs.html#writing-your-own-input-component for details."
      )
    }

    const { touched, error, helperText = false } = meta

    return (
      <FormControl
        className={className}
        component="fieldset"
        margin="normal"
        {...sanitizeRestProps(rest)}
      >
        <FormLabel component="legend" className={classes.label}>
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FormLabel>

        <FormGroup row>{choices.map(this.renderCheckbox)}</FormGroup>

        {touched && error && <FormHelperText error>{error}</FormHelperText>}

        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    )
  }
}

CheckboxGroupInput.propTypes = {
  choices: PropTypes.arrayOf(PropTypes.object),
  classes: PropTypes.object,
  className: PropTypes.string,
  label: PropTypes.string,
  source: PropTypes.string,
  options: PropTypes.object,
  id: PropTypes.string,
  input: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
  }),
  isRequired: PropTypes.bool,
  optionText: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.element,
  ]).isRequired,
  optionValue: PropTypes.string.isRequired,
  resource: PropTypes.string,
  translate: PropTypes.func.isRequired,
  translateChoice: PropTypes.bool.isRequired,
  meta: PropTypes.object,
  dataStructure: PropTypes.string.isRequired,
}

CheckboxGroupInput.defaultProps = {
  choices: [],
  classes: {},
  options: {},
  optionText: 'name',
  optionValue: 'id',
  translateChoice: true,
  dataStructure: DataStructures.REFERENCE_LIST,
}

const EnhancedCheckboxGroupInput = compose(
  addField,
  translate,
  withStyles(styles)
)(CheckboxGroupInput)

EnhancedCheckboxGroupInput.defaultProps = {
  fullWidth: true,
}

export default EnhancedCheckboxGroupInput
