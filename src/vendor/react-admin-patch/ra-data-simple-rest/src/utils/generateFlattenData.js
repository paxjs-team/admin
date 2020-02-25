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

import { isObject, uniq, keys } from 'lodash'

export default function generateFlattenData({
  diff,
  oldData = {},
  dataPath = '',
  resource,
}) {
  const newData = {}
  const filesToAdd = {}
  const filesToRemove = {}

  if (diff === null) {
    newData[dataPath] = null
  }

  changes(diff, oldData, dataPath)

  return { newData, filesToAdd, filesToRemove }

  function changes(newRecord, oldRecord, reference = '') {
    const properties = uniq([...keys(newRecord), ...keys(oldRecord)])

    properties.forEach(function(property) {
      const newValue = newRecord ? newRecord[property] : undefined
      const oldValue = oldRecord ? oldRecord[property] : undefined

      // handle file data type
      if (
        (isObject(oldValue) && oldValue.type === 'file') ||
        (isObject(newValue) && newValue.type === 'file')
      ) {
        // file was removed
        if (newValue === null || diff === null) {
          if (newRecord) {
            newData[
              `${reference}${reference === '' ? '' : '.'}${property}`
            ] = null
          }

          if (oldValue.uri) {
            filesToRemove[
              `${reference}${reference === '' ? '' : '.'}${property}`
            ] = oldValue.uri
          }
        }
        // file was updated
        else if (newValue && newValue.uri instanceof File) {
          // add resource name to upload file to resource folder later
          newValue.resource = resource

          filesToAdd[
            `${reference}${reference === '' ? '' : '.'}${property}`
          ] = newValue

          // add previous value to filesToRemove
          if (oldValue && oldValue.uri) {
            filesToRemove[
              `${reference}${reference === '' ? '' : '.'}${property}`
            ] = oldValue.uri
          }
        }
        // file uri was added as a string
        else if (!oldValue && typeof newValue.uri === 'string') {
          newData[
            `${reference}${reference === '' ? '' : '.'}${property}`
          ] = newValue
        }
        // file wasn't changed
        else if (oldValue && oldValue.uri) {
          newData[`${reference}${reference === '' ? '' : '.'}${property}`] =
            oldValue.uri
        }
      } else {
        const isNewValueObject = isObject(newValue)
        const isOldValueObject = isObject(oldValue)

        if (isOldValueObject || isNewValueObject) {
          if (!isNewValueObject) {
            if (newValue !== undefined) {
              newData[
                `${reference}${reference === '' ? '' : '.'}${property}`
              ] = newValue
            }

            changes(
              undefined,
              oldValue,
              `${reference}${reference === '' ? '' : '.'}${property}`
            )
          } else if (!isOldValueObject) {
            changes(
              newValue,
              undefined,
              `${reference}${reference === '' ? '' : '.'}${property}`
            )
          } else {
            changes(
              newValue,
              oldValue,
              `${reference}${reference === '' ? '' : '.'}${property}`
            )
          }
        } else if (newRecord && newValue !== undefined) {
          newData[
            `${reference}${reference === '' ? '' : '.'}${property}`
          ] = newValue
        }
      }
    })
  }
}
