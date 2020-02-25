/**
 *
 * listeners reducer
 *
 */

import ActionTypes from '../ActionTypes'

export default function(state = {}, action) {
  switch (action.type) {
    case ActionTypes.RESOURCES__SET_RESOURCE:
      return {
        ...state,
        [action.resource]: true,
      }

    default:
      return state
  }
}
