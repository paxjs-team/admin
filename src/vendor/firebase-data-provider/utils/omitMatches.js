/**
 *
 * omitMatches
 *
 */

import { isObject, isEqual } from 'lodash'

export default function omitMatches(
  target,
  omitSource,
  result = {},
  parentKey
) {
  Object.keys(target).forEach(prop => {
    const value = target[prop]

    if (omitSource[prop] === undefined) {
      if (parentKey) {
        if (!result[parentKey]) {
          result[parentKey] = {}
        }

        result[parentKey][prop] = value
      } else {
        result[prop] = value
      }
    } else if (isObject(omitSource[prop]) && isObject(value)) {
      if (!isEqual(value, omitSource[prop])) {
        omitMatches(value, omitSource[prop], result, prop)
      }
    } else if (value !== omitSource[prop]) {
      if (parentKey) {
        if (!result[parentKey]) {
          result[parentKey] = {}
        }

        result[parentKey][prop] = value
      } else {
        result[prop] = value
      }
    }
  })

  return result
}
