/**
 * Creates a data update object and a files update object
 *
 * "data" is
 *   {
 *     "/cities/Paris/country": "France",
 *     "/cities/Paris/population": 2 229 621,
 *   }
 *
 * "files" is
 *   {
 *     "/cities/Paris/image/400x400": <File> instance,
 *     "/cities/Paris/image/800x800": <File> instance,
 *   }
 *
 * @param  {Object} newData      New data
 * @param  {Object} oldData      Old data
 * @param  {String} pathPrefix   Path prefix, for example /cities/Paris
 * @return {Object}              returns { data, files }
 */

import { isEqual, isObject, uniq, keys } from 'lodash'
import ServerTimestamp from '../ServerTimestamp'

export default function generateUpdates({
  diff,
  oldData = {},
  dataPath = '',
  resource,
}) {
  const databaseDiff = {}
  const filesToAdd = {}
  const filesToRemove = {}

  if (diff === null) {
    databaseDiff[dataPath] = null
  }

  changes(diff, oldData, dataPath)

  return { databaseDiff, filesToAdd, filesToRemove }

  function changes(newRecord, oldRecord, reference = '') {
    const properties = uniq([...keys(newRecord), ...keys(oldRecord)])

    properties.forEach(function(property) {
      const newValue = newRecord ? newRecord[property] : undefined
      const oldValue = oldRecord ? oldRecord[property] : undefined

      if (!isEqual(newValue, oldValue)) {
        // handle file data type
        if (
          (isObject(oldValue) && oldValue.type === 'file') ||
          (isObject(newValue) && newValue.type === 'file')
        ) {
          // file was removed
          if (newValue === null || diff === null) {
            if (newRecord) {
              databaseDiff[`${reference}/${property}`] = null
            }

            if (oldValue.uri) {
              filesToRemove[`${reference}/${property}`] = oldValue
            }
          }
          // file was updated
          else if (newValue && newValue.uri instanceof File) {
            // add resource name to upload file to resource folder later
            newValue.resource = resource

            filesToAdd[`${reference}/${property}`] = newValue

            // add previous value to filesToRemove
            if (oldValue && oldValue.uri) {
              filesToRemove[`${reference}/${property}`] = oldValue
            }
          }
          // file uri was added as a string
          else if (!oldValue && typeof newValue.uri === 'string') {
            databaseDiff[`${reference}/${property}`] = newValue
          }
        } else if (isEqual(newValue, ServerTimestamp)) {
          databaseDiff[`${reference}/${property}`] = newValue
        } else {
          const isNewValueObject = isObject(newValue)
          const isOldValueObject = isObject(oldValue)

          if (isOldValueObject || isNewValueObject) {
            if (!isNewValueObject) {
              if (newValue !== undefined) {
                databaseDiff[`${reference}/${property}`] = newValue
              }

              changes(undefined, oldValue, `${reference}/${property}`)
            } else if (!isOldValueObject) {
              changes(newValue, undefined, `${reference}/${property}`)
            } else {
              changes(newValue, oldValue, `${reference}/${property}`)
            }
          } else if (newRecord && newValue !== undefined) {
            databaseDiff[`${reference}/${property}`] = newValue
          }
        }
      }
    })
  }
}
