/**
 *
 * action creators
 *
 */

import { CREATE, UPDATE, DELETE, SET } from './DataActionTypes'
import ServerTimestamp from './ServerTimestamp'
const firebaseKey = require('firebase-key')

export function create({ data, resource }) {
  if (!resource) {
    throw new Error(
      'Resource is not declared. Failed to dispatch CREATE action.'
    )
  }

  if (resource.primaryKey !== 'id') {
    data.id = String(data[resource.primaryKey])
  }

  if (!data.id) {
    data.id = firebaseKey.key()
  }

  return {
    type: CREATE,
    resource: resource.name,
    data,
  }
}

export function update({
  id,
  resource,
  diff = { updatedAt: ServerTimestamp },
}) {
  if (!resource) {
    throw new Error(
      'Resource is not declared. Failed to dispatch UPDATE action.'
    )
  }

  if (resource.primaryKey !== 'id' && diff[resource.primaryKey]) {
    diff.id = String(diff[resource.primaryKey])
  }

  return {
    type: UPDATE,
    id,
    resource: resource.name,
    diff,
  }
}

export function set({ resource, diff }) {
  if (!resource) {
    throw new Error('Resource is not declared. Failed to dispatch SET action.')
  }

  return {
    type: SET,
    resource: resource.name,
    diff,
  }
}

export function deleteAction({ id, resource }) {
  return {
    type: DELETE,
    id,
    resource: resource.name,
  }
}
