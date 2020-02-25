/**
 *
 * resources reducer
 *
 */

import ActionTypes from '../ActionTypes'
import { omit } from 'lodash'

export default function(state = {}, action) {
  switch (action.type) {
    case ActionTypes.RESOURCES__SET_RESOURCE:
      return {
        ...state,
        [action.resource]: action.data,
      }

    case ActionTypes.RESOURCES__SET_RESOURCE_ITEM:
      return {
        ...state,
        [action.resource]: {
          ...state[action.resource],
          [action.itemId]: action.data,
        },
      }

    case ActionTypes.RESOURCES__UNSET_RESOURCE_ITEM:
      return {
        ...state,
        [action.resource]: omit(state[action.resource], action.itemId),
      }

    default:
      return state
  }
}
