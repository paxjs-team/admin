/**
 *
 * Get resource data async
 *
 */

import firebase from 'firebase/app'
import store from './redux/store'
import {
  setResouce,
  setResouceItem,
  unsetResouceItem,
} from './redux/actionCreators'

export default async function getResourceDataAsync({ resource, id, watch }) {
  const { listeners } = store.getState()

  // Get the entire resource data
  if (!id) {
    // Resource was not fetched before
    if (!listeners[resource]) {
      const ref = firebase.database().ref(resource)

      // Fetch resource data
      const snap = await ref.once('value')

      const resourceData = snap.val() || {}

      store.dispatch(setResouce(resource, snap.val() || {}))

      // Attach listener to update fetched resource data on change
      setTimeout(() => {
        if (watch) {
          ref.on('value', function(snap) {
            store.dispatch(setResouce(resource, snap.val() || {}))
          })
        } else {
          ref
            .orderByChild('createdAt')
            .startAt(Date.now())
            .on('child_added', function(snap) {
              store.dispatch(setResouceItem(resource, snap.key, snap.val()))
            })

          ref.on('child_removed', function(snap) {
            store.dispatch(unsetResouceItem(resource, snap.key))
          })

          ref.on('child_changed', function(snap) {
            store.dispatch(setResouceItem(resource, snap.key, snap.val()))
          })
        }
      }, 100)

      return resourceData
    }

    // Resource was already fetched, returning its data
    return store.getState().resources[resource]
  }

  // Get resource record by ID
  // Resource was not fetched, fetching only one requested record by ID
  if (!listeners[resource]) {
    const snap = await firebase
      .database()
      .ref(resource)
      .child(id)
      .once('value')

    const recordData = snap.val()

    store.dispatch(setResouceItem(resource, id, recordData))

    return recordData
  }

  // Resource was fetched, returning record by ID
  return store.getState().resources[resource][id]
}
