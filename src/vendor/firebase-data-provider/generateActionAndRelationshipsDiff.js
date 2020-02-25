/**
 *
 * generateActionAndRelationshipsDiff
 *
 */

import { CREATE, UPDATE, DELETE, SET } from './DataActionTypes'
import getResourceDataAsync from './getResourceDataAsync'
import store from './redux/store'
import {
  updateDiff as updateCurrentDiff,
  declareReassign,
  setBeforeActionDiff,
} from './redux/actionCreators'
import ServerTimestamp from './ServerTimestamp'
import compareDiffToDiff from './utils/compareDiffToDiff'
import { isEmpty, omit, get, merge } from 'lodash'
import makeGetDerivedResourceDataAsync from './makeGetDerivedResourceDataAsync'
import isReassignedFromTo from './isReassignedFromTo'
import getRecordPreviousId from './getRecordPreviousId'

function updateDiff(diff) {
  store.dispatch(setBeforeActionDiff(store.getState().diff))
  store.dispatch(updateCurrentDiff(diff))
}

const log = process.env.REACT_APP__ENVIRONMENT === 'development'

export default async function generateActionAndRelationshipsDiff(
  actions,
  resources,
  DataActions
) {
  if (!actions.length) {
    return
  }

  const action = actions.pop()

  log && console.info('action: ', action)

  switch (action.type) {
    case CREATE: {
      if (
        await getResourceDataAsync({
          resource: action.resource,
          id: action.data.id,
        })
      ) {
        return Promise.reject(new Error('ID already in use'))
      }

      const diff = {
        [action.resource]: {
          [action.data.id]: Object.assign(
            {
              updatedAt: ServerTimestamp,
              createdAt: ServerTimestamp,
            },
            action.data
          ),
        },
      }

      log && console.info('action diff: ', JSON.stringify(diff, null, 4))

      const currentDiff = store.getState().diff

      log &&
        console.info('current diff: ', JSON.stringify(currentDiff, null, 4))

      const { newValues, conflicts } = compareDiffToDiff(diff, currentDiff)

      log && console.info('newValues: ', JSON.stringify(newValues, null, 4))
      log && console.info('conflicts: ', JSON.stringify(conflicts, null, 4))

      if (!isEmpty(conflicts)) {
        return Promise.reject(
          `Relationship has conflicts with original action or another relationship \n${JSON.stringify(
            conflicts,
            null,
            4
          )}`
        )
      }

      if (!isEmpty(newValues)) {
        updateDiff(newValues)

        const actionResourceRelationships =
          resources[action.resource].relationships

        if (
          actionResourceRelationships &&
          actionResourceRelationships.onCreate
        ) {
          let relationshipActions = await actionResourceRelationships.onCreate(
            action,
            makeGetDerivedResourceDataAsync(action, 'diff'),
            makeGetDerivedResourceDataAsync(action, 'beforeActionDiff'),
            isReassignedFromTo,
            DataActions
          )

          if (relationshipActions) {
            if (Array.isArray(relationshipActions)) {
              relationshipActions.forEach(item => actions.push(item))
            } else {
              actions.push(relationshipActions)
            }

            if (actions.length) {
              await generateActionAndRelationshipsDiff(
                actions,
                resources,
                DataActions
              )
            }
          }
        }
      }

      break
    }

    case UPDATE: {
      let diff

      const currentDiff = store.getState().diff
      const resolvedConflicts = []

      if (action.diff.id !== undefined && action.diff.id !== action.id) {
        if (
          await getResourceDataAsync({
            resource: action.resource,
            id: action.diff.id,
          })
        ) {
          return Promise.reject(new Error('ID already in use'))
        }

        const currentRecordDiff = get(currentDiff, [action.resource, action.id])

        const nextRecordDiff = currentRecordDiff
          ? merge({}, currentRecordDiff, action.diff)
          : action.diff

        if (currentRecordDiff) {
          resolvedConflicts.push([action.resource, action.id])
        }

        diff = {
          [action.resource]: {
            [action.id]: null,
            [action.diff.id]: nextRecordDiff,
          },
        }
      } else {
        diff = {
          [action.resource]: {
            [action.id]: action.diff,
          },
        }
      }

      log && console.info('action diff: ', JSON.stringify(diff, null, 4))

      log &&
        console.info('current diff: ', JSON.stringify(currentDiff, null, 4))

      log &&
        console.info(
          'resolvedConflicts: ',
          JSON.stringify(resolvedConflicts, null, 4)
        )

      let { newValues, conflicts } = compareDiffToDiff(diff, currentDiff)

      if (resolvedConflicts.length) {
        resolvedConflicts.forEach(([resource, id]) => {
          const recordConflict = get(conflicts, [resource, id])

          if (recordConflict !== undefined) {
            conflicts = {
              ...conflicts,
              [resource]: omit(conflicts[resource], [id]),
            }

            if (isEmpty(conflicts[resource])) {
              conflicts = omit(conflicts, [resource])
            }
          }
        })
      }

      log && console.info('newValues: ', JSON.stringify(newValues, null, 4))
      log && console.info('conflicts: ', JSON.stringify(conflicts, null, 4))

      if (!isEmpty(conflicts)) {
        return Promise.reject(
          `Relationship has conflicts with original action or another relationship \n${JSON.stringify(
            conflicts,
            null,
            4
          )}`
        )
      }

      if (!isEmpty(newValues)) {
        const originalRecordId = getRecordPreviousId({
          id: action.id,
          resource: action.resource,
        })

        const originalRecordData = await getResourceDataAsync({
          resource: action.resource,
          id: originalRecordId,
        })

        const { newValues: newValuesCompareToOriginal } = compareDiffToDiff(
          newValues[action.resource][action.diff.id || action.id],
          originalRecordData
        )

        log &&
          console.info(
            'newValuesCompareToOriginal: ',
            JSON.stringify(newValuesCompareToOriginal, null, 4)
          )

        if (!isEmpty(newValuesCompareToOriginal)) {
          updateDiff(newValues)

          if (action.diff.id) {
            store.dispatch(
              declareReassign({
                resource: action.resource,
                toId: action.diff.id,
                fromId: action.id,
              })
            )
          }

          const actionResourceRelationships =
            resources[action.resource].relationships

          if (
            actionResourceRelationships &&
            actionResourceRelationships.onUpdate
          ) {
            let relationshipActions = await actionResourceRelationships.onUpdate(
              action,
              makeGetDerivedResourceDataAsync(action, 'diff'),
              makeGetDerivedResourceDataAsync(action, 'beforeActionDiff'),
              isReassignedFromTo,
              DataActions
            )

            if (relationshipActions) {
              if (Array.isArray(relationshipActions)) {
                relationshipActions.forEach(item => actions.push(item))
              } else {
                actions.push(relationshipActions)
              }

              if (actions.length) {
                await generateActionAndRelationshipsDiff(
                  actions,
                  resources,
                  DataActions
                )
              }
            }
          }
        }
      }

      break
    }

    case SET: {
      let diff

      const currentDiff = store.getState().diff

      diff = {
        [action.resource]: action.diff,
      }

      log && console.info('action diff: ', JSON.stringify(diff, null, 4))

      log &&
        console.info('current diff: ', JSON.stringify(currentDiff, null, 4))

      const { newValues, conflicts } = compareDiffToDiff(diff, currentDiff)

      log && console.info('newValues: ', JSON.stringify(newValues, null, 4))
      log && console.info('conflicts: ', JSON.stringify(conflicts, null, 4))

      if (!isEmpty(conflicts)) {
        return Promise.reject(
          `Relationship has conflicts with original action or another relationship \n${JSON.stringify(
            conflicts,
            null,
            4
          )}`
        )
      }

      if (!isEmpty(newValues)) {
        updateDiff(newValues)

        const actionResourceRelationships =
          resources[action.resource].relationships

        if (
          actionResourceRelationships &&
          actionResourceRelationships.onUpdate
        ) {
          let relationshipActions = await actionResourceRelationships.onUpdate(
            action,
            makeGetDerivedResourceDataAsync(action, 'diff'),
            makeGetDerivedResourceDataAsync(action, 'beforeActionDiff'),
            isReassignedFromTo,
            DataActions
          )

          if (relationshipActions) {
            if (Array.isArray(relationshipActions)) {
              relationshipActions.forEach(item => actions.push(item))
            } else {
              actions.push(relationshipActions)
            }

            if (actions.length) {
              await generateActionAndRelationshipsDiff(
                actions,
                resources,
                DataActions
              )
            }
          }
        }
      }

      break
    }

    case DELETE: {
      const diff = {
        [action.resource]: action.id
          ? {
              [action.id]: null,
            }
          : null,
      }

      log && console.info('action diff: ', JSON.stringify(diff, null, 4))

      const currentDiff = store.getState().diff

      log &&
        console.info('current diff: ', JSON.stringify(currentDiff, null, 4))

      const { newValues, conflicts } = compareDiffToDiff(diff, currentDiff)

      log && console.info('newValues: ', JSON.stringify(newValues, null, 4))
      log && console.info('conflicts: ', JSON.stringify(conflicts, null, 4))

      if (!isEmpty(conflicts)) {
        return Promise.reject(
          `Relationship has conflicts with original action or another relationship \n${JSON.stringify(
            conflicts,
            null,
            4
          )}`
        )
      }

      if (!isEmpty(newValues)) {
        updateDiff(newValues)

        const actionResourceRelationships =
          resources[action.resource].relationships

        if (
          actionResourceRelationships &&
          actionResourceRelationships.onDelete
        ) {
          let relationshipActions = await actionResourceRelationships.onDelete(
            action,
            makeGetDerivedResourceDataAsync(action, 'diff'),
            makeGetDerivedResourceDataAsync(action, 'beforeActionDiff'),
            isReassignedFromTo,
            DataActions
          )

          if (relationshipActions) {
            if (Array.isArray(relationshipActions)) {
              relationshipActions.forEach(item => actions.push(item))
            } else {
              actions.push(relationshipActions)
            }

            if (actions.length) {
              await generateActionAndRelationshipsDiff(
                actions,
                resources,
                DataActions
              )
            }
          }
        }
      }

      break
    }

    default:
      return Promise.reject('Unsupported action type ' + action.type)
  }

  if (actions.length) {
    return generateActionAndRelationshipsDiff(actions, resources, DataActions)
  }
}
