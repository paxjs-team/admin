/**
 *
 * Firebase data provider
 *
 */

import firebase from 'firebase/app'

import {
  GET_LIST,
  GET_ONE,
  GET_MANY,
  GET_MANY_REFERENCE,
  CREATE,
  UPDATE,
  DELETE,
  DELETE_MANY,
  SET,
} from './DataActionTypes'
import * as Handlers from './handlers'
import * as OriginalDataActions from './DataActions'
import handleDataAction from './handleDataAction'
import compareRecordToRecord from './utils/compareRecordToRecord'
import getResourceDataAsync from './getResourceDataAsync'
import getRecordFinalId from './getRecordFinalId'
import clearReassigns from './clearReassigns'
import { omit } from 'lodash'

export default (trackedResources = [], firebaseConfig = {}) => {
  const relationships = []

  const resources = {}

  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig)
  }

  trackedResources.forEach(resource => {
    resources[resource.name] = resource

    if (resource.relationships) {
      if (resource.relationships.onCreate) {
        relationships.push({
          resource: resource.name,
          actionType: CREATE,
          generate: resource.relationships.onCreate,
        })
      }

      if (resource.relationships.onUpdate) {
        relationships.push({
          resource: resource.name,
          actionType: UPDATE,
          generate: resource.relationships.onUpdate,
        })
      }

      if (resource.relationships.onDelete) {
        relationships.push({
          resource: resource.name,
          actionType: DELETE,
          generate: resource.relationships.onDelete,
        })
      }
    }
  })

  const DataActions = {
    create: argv => {
      argv.resource = resources[argv.resource]

      return OriginalDataActions.create(argv)
    },
    update: argv => {
      argv.resource = resources[argv.resource]

      return OriginalDataActions.update(argv)
    },
    set: argv => {
      argv.resource = resources[argv.resource]

      return OriginalDataActions.set(argv)
    },
    delete: argv => {
      argv.resource = resources[argv.resource]

      return OriginalDataActions.deleteAction(argv)
    },
  }

  return async (type, resourceName, params) => {
    switch (type) {
      case GET_LIST:
      case GET_MANY_REFERENCE:
        return Handlers.getList(resources[resourceName], params)

      case GET_MANY:
        return Handlers.getMany(resources[resourceName], params)

      case GET_ONE:
        return Handlers.getOne(resources[resourceName], params)

      case CREATE: {
        const action = DataActions.create({
          resource: resourceName,
          data: params.data,
        })

        await handleDataAction(action, resources, DataActions)

        const finalId = getRecordFinalId({
          id: params.data.id,
          resource: resourceName,
        })

        const data = await getResourceDataAsync({
          resource: resourceName,
          id: finalId,
        })

        clearReassigns()

        return { data }
      }

      case UPDATE: {
        let oldData, newData, diff, action

        // SET
        if (params.id === undefined) {
          oldData = await getResourceDataAsync({
            resource: resourceName,
          })

          newData = omit(params.data, ['id'])

          diff = compareRecordToRecord(newData, oldData)

          action = DataActions.set({
            resource: resourceName,
            diff,
          })
        }
        // UPDATE
        else {
          oldData = await getResourceDataAsync({
            resource: resourceName,
            id: params.id,
          })

          newData = params.data

          diff = compareRecordToRecord(newData, oldData)

          action = DataActions.update({
            resource: resourceName,
            id: params.id,
            diff,
          })
        }

        await handleDataAction(action, resources, DataActions)

        let data

        // SET
        if (params.id === undefined) {
          data = await getResourceDataAsync({
            resource: resourceName,
          })

          data.id = params.id
        }
        // UPDATE
        else {
          const finalId = getRecordFinalId({
            id: params.id,
            resource: resourceName,
          })

          data = await getResourceDataAsync({
            resource: resourceName,
            id: finalId,
          })
        }

        clearReassigns()

        return { data }
      }

      case SET: {
        const oldData = await getResourceDataAsync({
          resource: resourceName,
        })

        const newData = params.data

        const diff = compareRecordToRecord(newData, oldData)

        const action = DataActions.set({
          resource: resourceName,
          diff,
        })

        await handleDataAction(action, resources, DataActions)

        const data = await getResourceDataAsync({
          resource: resourceName,
          forceFetch: true,
        })

        data.id = params.id

        clearReassigns()

        return { data }
      }

      case DELETE: {
        const action = DataActions.delete({
          resource: resourceName,
          id: params.id,
        })

        await handleDataAction(action, resources, DataActions)

        clearReassigns()

        return { data: { id: 'undefined' } }
      }

      case DELETE_MANY: {
        const actions = params.ids.map(id =>
          DataActions.delete({ resource: resourceName, id })
        )

        await handleDataAction(actions, resources, DataActions)

        clearReassigns()

        return { data: params.ids }
      }

      default:
        console.error('Undocumented method: ', type)

        return { data: [] }
    }
  }
}
