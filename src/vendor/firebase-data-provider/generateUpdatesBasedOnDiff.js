/**
 *
 * generateUpdatesBasedOnDiff
 *
 */

import store from './redux/store'
import generateUpdates from './utils/generateUpdates'
import getResourceDataAsync from './getResourceDataAsync'
import ServerTimestamp from './ServerTimestamp'
import { merge, cloneDeep, isEmpty } from 'lodash'
import isRecordReassigned from './isRecordReassigned'
import getRecordPreviousId from './getRecordPreviousId'

export default async function(resources) {
  const updates = {
    databaseDiff: {},
    filesToAdd: {},
    filesToRemove: {},
  }

  const { diff } = store.getState()

  const updatedResources = Object.keys(diff)

  await Promise.all(
    updatedResources.map(async resource => {
      if (resources[resource].dataType === 'record') {
        const dataPath = `/${resource}`
        const resourceDiff = diff[resource]

        const oldData = await getResourceDataAsync({
          resource,
        })

        const { filesToAdd, filesToRemove, databaseDiff } = generateUpdates({
          diff: resourceDiff,
          oldData,
          dataPath,
          resource,
        })

        if (
          resourceDiff !== null &&
          !isEmpty(databaseDiff) &&
          oldData &&
          oldData.updatedAt
        ) {
          databaseDiff[`${dataPath}/updatedAt`] = ServerTimestamp
        }

        Object.assign(updates.databaseDiff, databaseDiff)
        Object.assign(updates.filesToAdd, filesToAdd)
        Object.assign(updates.filesToRemove, filesToRemove)

        return Promise.resolve()
      }

      await Promise.all(
        Object.keys(diff[resource]).map(async diffRecordId => {
          let filesToAdd,
            filesToRemove,
            databaseDiff = {}

          if (isRecordReassigned({ id: diffRecordId, resource })) {
            databaseDiff[`/${resource}/${diffRecordId}`] = null
          } else {
            const originalRecordId = getRecordPreviousId({
              id: diffRecordId,
              resource,
            })

            const oldData = await getResourceDataAsync({
              resource,
              id: originalRecordId,
            })

            if (originalRecordId !== diffRecordId) {
              const newDataPath = `/${resource}/${diffRecordId}`
              const oldDataPath = `/${resource}/${originalRecordId}`

              ;({ filesToAdd } = generateUpdates({
                diff: diff[resource][diffRecordId],
                oldData,
                dataPath: newDataPath,
                resource: resource,
              }))
              ;({ filesToRemove } = generateUpdates({
                diff: diff[resource][diffRecordId],
                oldData,
                dataPath: oldDataPath,
                resource: resource,
              }))
              ;({ databaseDiff } = generateUpdates({
                diff: merge(cloneDeep(oldData), diff[resource][diffRecordId]),
                dataPath: newDataPath,
                resource: resource,
              }))

              databaseDiff[oldDataPath] = null
              databaseDiff[`${newDataPath}/updatedAt`] = ServerTimestamp
              databaseDiff[`${newDataPath}/createdAt`] = ServerTimestamp
            } else {
              const dataPath = `/${resource}/${diffRecordId}`
              const recordDiff = diff[resource][diffRecordId]

              ;({ filesToAdd, filesToRemove, databaseDiff } = generateUpdates({
                diff: recordDiff,
                oldData,
                dataPath,
                resource,
              }))

              if (
                recordDiff !== null &&
                !isEmpty(databaseDiff) &&
                oldData &&
                oldData.updatedAt
              ) {
                databaseDiff[`${dataPath}/updatedAt`] = ServerTimestamp
              }
            }
          }

          Object.assign(updates.databaseDiff, databaseDiff)
          Object.assign(updates.filesToAdd, filesToAdd)
          Object.assign(updates.filesToRemove, filesToRemove)
        })
      )
    })
  )

  return updates
}
