/**
 *
 * Validators
 * https://marmelab.com/react-admin/CreateEdit.html#validation
 *
 */

import moment from 'moment'
import { required } from 'react-admin'

export { required } from 'react-admin'
export const requiredFieldValidation = [required()]

export function isBefore(compareToDateField) {
  return function(value, formData) {
    const compareToDate = formData[compareToDateField]

    return value && compareToDate && !moment(value).isBefore(compareToDate)
      ? `needs to be before "${compareToDateField}"`
      : undefined
  }
}

export function isAfter(compareToDateField) {
  return function(value, formData) {
    const compareToDate = formData[compareToDateField]

    return value && compareToDate && !moment(value).isAfter(compareToDate)
      ? `needs to be after "${compareToDateField}"`
      : undefined
  }
}

export function minValue(min, message = 'Too small') {
  return function(value) {
    return value && value < min ? message : undefined
  }
}

export function maxLength(max, message = 'Too short') {
  return function(value) {
    return value && value.length > max ? message : undefined
  }
}

export function number(message = 'Must be a number') {
  return function(value) {
    return value && isNaN(Number(value)) ? message : undefined
  }
}

export function firebaseKey(value) {
  return !/^[-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz]*$/.test(
    value
  )
    ? 'Valid characters are A-Z a-z 0-9 _-'
    : undefined
}

export function countryBasedId(value) {
  return !/^cb-.+$/.test(value)
    ? 'Country based ID should start with "cb-"'
    : undefined
}

export function localeBasedId(value) {
  return !/^cb-.+$/.test(value)
    ? 'Locale based ID should start with "lb-"'
    : undefined
}

export const requiredFirebaseKeyValidation = [required(), firebaseKey]
