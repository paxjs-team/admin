/**
 *
 * compareDiffToDiff
 *
 */

import { isEqual, isObject, set } from 'lodash'
import isNullData from './isNullData'

export default function compareDiffToDiff(diff, baseDiff) {
  if (!baseDiff) {
    return {
      newValues: diff,
      conflicts: {},
    }
  }

  const newValues = {}
  const conflicts = {}

  function changes(object, base, parentPath = []) {
    Object.keys(object).forEach(function(key) {
      const value = object[key]

      if (!isEqual(value, base[key])) {
        if (isObject(value) && isObject(base[key])) {
          changes(value, base[key], [...parentPath, key])
        } else if (
          base[key] === undefined ||
          (value === null && isNullData(base[key]))
        ) {
          if (parentPath.length) {
            set(newValues, [...parentPath, key], value)
          } else {
            newValues[key] = value
          }
        } else if (parentPath.length) {
          set(conflicts, [...parentPath, key], value)
          set(newValues, [...parentPath, key], value)
        } else {
          conflicts[key] = value
          newValues[key] = value
        }
      } else if (key === 'type' && value === 'file') {
        if (parentPath.length) {
          set(newValues, [...parentPath, key], value)
        } else {
          newValues[key] = value
        }
      }
    })
  }

  changes(diff, baseDiff)

  return {
    newValues,
    conflicts,
  }
}
