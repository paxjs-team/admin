/**
 *
 * isNullData
 *
 */

import { values as getValues, isObject } from 'lodash'

export default function isNullData(data) {
  if (data === null) {
    return true
  }

  const values = getValues(data)

  for (let i = 0; i < values.length; i++) {
    const value = values[i]

    if (value !== null && !(isObject(value) && isNullData(value))) {
      return false
    }
  }

  return true
}
