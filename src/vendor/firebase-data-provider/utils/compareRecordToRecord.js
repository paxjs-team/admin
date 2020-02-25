/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */

import { isEqual, isObject, uniq, keys } from 'lodash'

export default function compareRecordToRecord(object, base) {
  function changes(object, base) {
    const properties = uniq([...keys(object), ...keys(base)])

    return properties.reduce(function(result, property) {
      const newValue = object[property]
      const oldValue = base[property]

      if (
        (isObject(oldValue) && oldValue.type === 'file') ||
        (isObject(newValue) && newValue.type === 'file')
      ) {
        // file was removed, added or changed
        if (!newValue || !oldValue || newValue.uri !== oldValue.uri) {
          result[property] = newValue
        }
      } else if (!isEqual(newValue, oldValue)) {
        result[property] =
          isObject(newValue) && isObject(oldValue)
            ? changes(newValue, oldValue)
            : newValue === undefined
            ? null
            : newValue
      }

      return result
    }, {})
  }

  return changes(object, base)
}
