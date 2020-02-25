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
    values = []

  // Copy the filter params so we can modify for GET_MANY_REFERENCE support.
  const filter = Object.assign({}, params.filter)

  if (params.target && params.id) {
    filter[params.target] = params.id
  }

  const filterKeys = Object.keys(filter)

  /* TODO Must have a better way */
  if (filterKeys.length) {
    Object.values(resourceData).forEach(value => {
      let filterIndex = 0

      while (filterIndex < filterKeys.length) {
        let property = filterKeys[filterIndex]

        if (isObject(property) && !value[property]) {
          return
        }

        if (Array.isArray(filter[property])) {
          let propertyValue = value[property]

          if (!propertyValue) {
            return
          }

          if (!Array.isArray(propertyValue)) {
            // handle ID -> Boolean and ID -> Number maps
            if (isObject(propertyValue)) {
              propertyValue = Object.keys(propertyValue)
            } else {
              propertyValue = [propertyValue]
            }
          }

          if (!intersection(filter[property], propertyValue).length) {
            return
          }
        } else if (
          property !== 'q' &&
          ((value[property] !== filter[property] &&
            !isArray(filter[property])) ||
            (isArray(filter[property]) &&
              filter[property].indexOf(value[property]) === -1))
        ) {
          return
        } else if (property === 'q') {
          const pattern = new RegExp(filter['q'], 'i')

          if (!pattern.test(JSON.stringify(value))) {
            return
          }
        }

        filterIndex++
      }

      values.push(value)
    })
  } else {
    values = Object.values(resourceData)
  }

  if (params.sort) {
    arraySort(values, params.sort.field, {
      reverse: params.sort.order !== 'ASC',
    })
  }

  const { page, perPage } = params.pagination
  const _start = (page - 1) * perPage
  const _end = page * perPage

  data = values.slice(_start, _end)
  ids = data.map(item => item.id)
  total = values.length

  return { data, ids, total }
}
