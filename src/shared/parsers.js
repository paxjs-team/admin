/**
 *
 * redux-form Input parsers
 *
 */

export function convertEmptyStringToNull(value) {
  if (value === '') {
    return null
  }

  return value
}
