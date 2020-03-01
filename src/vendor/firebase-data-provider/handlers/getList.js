/**
 *
 * GET_LIST, GET_MANY_REFERENCE
 *
 */

import { isArray, isObject, intersection } from 'lodash'
import arraySort from 'array-sort'
import getResourceDataAsync from '../getResourceDataAsync'

export default async function(resource, params) {
  const resourceData = await getResourceDataAsync({ resource: resource.name })

  if (!params.pagination) {
    console.error('Unexpected parameters: ', params)

    return Promise.reject(new Error('Error processing request'))
  }

  let ids = [],
    data = [],
    total = 0,
    matchedRecords = []

  // Copy the filter params so we can modify for GET_MANY_REFERENCE support.
  const filter = Object.assign({}, params.filter)

  if (params.target && params.id) {
    filter[params.target] = params.id
  }

  const filterKeys = Object.keys(filter)

  /* TODO Must have a better way */
  if (filterKeys.length) {
    Object.values(resourceData).forEach(record => {
      let filterIndex = 0

      while (filterIndex < filterKeys.length) {
        let propertyToFilter = filterKeys[filterIndex]

        let propertyValue

        if (record[propertyToFilter]) {
          propertyValue = record[propertyToFilter]
        } else if (
          resource.customFilters &&
          resource.customFilters[propertyToFilter]
        ) {
          const derivedPropertyGetter = resource.customFilters[propertyToFilter]

          propertyValue = derivedPropertyGetter(record)
        }

        if (isObject(propertyToFilter) && !propertyValue) {
          return
        }

        if (Array.isArray(filter[propertyToFilter])) {
          let value = propertyValue

          if (!value) {
            return
          }

          if (!Array.isArray(value)) {
            // handle ID -> Boolean and ID -> Number maps
            if (isObject(value)) {
              value = Object.keys(value)
            } else {
              value = [value]
            }
          }

          if (!intersection(filter[propertyToFilter], value).length) {
            return
          }
        } else if (
          propertyToFilter !== 'q' &&
          ((propertyValue !== filter[propertyToFilter] &&
            !isArray(filter[propertyToFilter])) ||
            (isArray(filter[propertyToFilter]) &&
              filter[propertyToFilter].indexOf(propertyValue) === -1))
        ) {
          return
        } else if (propertyToFilter === 'q') {
          const pattern = new RegExp(filter['q'], 'i')

          if (!pattern.test(JSON.stringify(record))) {
            return
          }
        }

        filterIndex++
      }

      matchedRecords.push(record)
    })
  } else {
    matchedRecords = Object.values(resourceData)
  }

  if (params.sort) {
    arraySort(matchedRecords, params.sort.field, {
      reverse: params.sort.order !== 'ASC',
    })
  }

  const { page, perPage } = params.pagination
  const _start = (page - 1) * perPage
  const _end = page * perPage

  data = matchedRecords.slice(_start, _end)
  ids = data.map(item => item.id)
  total = matchedRecords.length

  return { data, ids, total }
}
