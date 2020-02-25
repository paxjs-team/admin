/**
 *
 * handleDataAction
 *
 */

import generateActionAndRelationshipsDiff from './generateActionAndRelationshipsDiff'
import generateUpdatesBasedOnDiff from './generateUpdatesBasedOnDiff'
import runUpdates from './runUpdates'
import store from './redux/store'
import { clearDiff } from './redux/actionCreators'

export default async function(actions, resources, DataActions) {
  try {
    const actionsToHandle = Array.isArray(actions) ? actions : [actions]

    console.info(
      '\n\n1. handleDataAction > actions to handle: ',
      actionsToHandle
    )

    await generateActionAndRelationshipsDiff(
      actionsToHandle,
      resources,
      DataActions
    )

    const updates = await generateUpdatesBasedOnDiff(resources)

    console.info('2. handleDataAction > actions updates: ', updates)

    await runUpdates(updates)

    console.info(
      '3. handleDataAction > actions updates were applied successfully!'
    )

    store.dispatch(clearDiff())
  } catch (err) {
    store.dispatch(clearDiff())

    return Promise.reject(err)
  }
}
