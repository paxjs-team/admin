/**
 *
 * DateTimeInput
 *
 */

import React from 'react'
import PropTypes from 'prop-types'

import { DateTimeInput as RADateTimeInput } from 'react-admin'

import { debounce } from 'lodash'
import convertDateToString from '@/shared/utils/convertDateToString'
import getUTCOffset from '@/shared/utils/getUTCOffset'

export default class DateTimeInput extends React.Component {
  static propTypes = {
    valueUTCOffset: PropTypes.string.isRequired,
    input: PropTypes.shape({
      value: PropTypes.string,
      onChange: PropTypes.func,
    }),
  }

  static defaultProps = {
    valueUTCOffset: '+0',
  }

  constructor(props) {
    super(props)

    const { valueUTCOffset, input } = props

    const userUTCOffset = Number(getUTCOffset())

    const displayValueHoursDiff = userUTCOffset - Number(valueUTCOffset)

    this._displayValueMsDiff = displayValueHoursDiff * 60 * 60 * 1000

    this.state = {
      displayValue: this._getDisplayValueFromInputValue(input.value),
    }
  }

  render() {
    const { valueUTCOffset, input, ...rest } = this.props
    const { displayValue } = this.state

    return (
      <RADateTimeInput
        {...rest}
        input={{
          ...input,
          value: displayValue,
          onBlur: this._onBlur,
          onChange: this._onChange,
        }}
      />
    )
  }

  _onBlur() {}

  _onChange = event => {
    this._displayValue = event.target.value

    this.setState({ displayValue: this._displayValue })

    this._debouncedOnChange()
  }

  _debouncedOnChange = debounce(() => {
    const inputValue = this._getInputValueFromDisplayValue(this._displayValue)

    this.props.input.onChange(inputValue)
  }, 400)

  _getDisplayValueFromInputValue = inputValue => {
    if (!this._displayValueMsDiff || !inputValue) {
      return ''
    }

    const date = new Date(inputValue)

    date.setTime(date.getTime() + this._displayValueMsDiff)

    return convertDateToString(date)
  }

  _getInputValueFromDisplayValue = displayValue => {
    if (!this._displayValueMsDiff || !displayValue) {
      return ''
    }

    const date = new Date(displayValue)

    date.setTime(date.getTime() - this._displayValueMsDiff)

    return convertDateToString(date)
  }
}
