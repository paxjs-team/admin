/**
 *
 * Action creators
 *
 */

import ActionTypes from './ActionTypes'

export const setResouce = (resource, data) => ({
  type: ActionTypes.RESOURCES__SET_RESOURCE,
  resource,
  data,
})

export const setResouceItem = (resource, itemId, data) => ({
  type: ActionTypes.RESOURCES__SET_RESOURCE_ITEM,
  resource,
  itemId,
  data,
})

export const unsetResouceItem = (resource, itemId) => ({
  type: ActionTypes.RESOURCES__UNSET_RESOURCE_ITEM,
  resource,
  itemId,
})

export const updateDiff = diff => ({
  type: ActionTypes.DIFF__UPDATE,
  diff,
})

export const setBeforeActionDiff = diff => ({
  type: ActionTypes.BEFORE_ACTION_DIFF__SET,
  diff,
})

export const clearDiff = () => ({ type: ActionTypes.DIFF__CLEAR })

export const declareReassign = ({ resource, toId, fromId }) => ({
  type: ActionTypes.REASSIGNS__DECLARE,
  payload: {
    [resource]: {
      toFrom: {
        [toId]: fromId,
      },
      fromTo: {
        [fromId]: toId,
      },
    },
  },
})

export const clearReassigns = () => ({ type: ActionTypes.REASSIGNS__CLEAR })
