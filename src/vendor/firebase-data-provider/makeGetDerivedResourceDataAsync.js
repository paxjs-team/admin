/**
 *
 * Make derived resource data async getter
 *
 */

import getResourceDataAsync from './getResourceDataAsync'
import store from './redux/store'
import { get, merge, cloneDeep, isEmpty } from 'lodash'
import isRecordReassigned from './isRecordReassigned'
import getRecordPreviousId from './getRecordPreviousId'

export default function makeGetDerivedResourceDataAsync(action, diffKey) {
  return async function getDerivedResourceDataAsync({ resource, id }) {
    const diff = store.getState()[diffKey]

    // fetching collection
    if (!id) {
      const resourceData = await getResourceDataAsync({ resource, id })

      const resourceDiff = diff[resource]

      if (resourceDiff !== undefined && !isEmpty(resourceDiff)) {
        const derivedData = { ...resourceData }

        Object.keys(diff[resource]).forEach(diffRecordId => {
          const recordDiff = resourceDiff[diffRecordId]

          const originalRecordId = getRecordPreviousId({
            id: diffRecordId,
            resource,
          })

          const originalRecordData = resourceData[originalRecordId]

          if (recordDiff !== undefined) {
            if (isRecordReassigned({ id: diffRecordId, resource })) {
              delete derivedData[diffRecordId]
            } else if (recordDiff === null) {
              delete derivedData[diffRecordId]
            } else {
              derivedData[diffRecordId] = merge(
                cloneDeep(originalRecordData),
                recordDiff
              )
            }
          }
        })

        return derivedData
      }

      return resourceData
    }

    // fetching record
    const recordDiff = get(diff, [resource, id])

    if (recordDiff === undefined) {
      return getResourceDataAsync({ resource, id })
    }

    if (recordDiff === null) {
      return null
    }

    const originalRecordId = getRecordPreviousId({
      id,
      resource,
    })

    const originalRecordData = await getResourceDataAsync({
      resource,
      id: originalRecordId,
    })

    return merge(cloneDeep(originalRecordData), recordDiff)
  }
}
