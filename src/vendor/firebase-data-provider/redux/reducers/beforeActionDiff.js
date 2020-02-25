/**
 *
 * before action diff reducer
 *
 */

import ActionTypes from '../ActionTypes'

export default function(state = {}, action) {
  switch (action.type) {
    case ActionTypes.BEFORE_ACTION_DIFF__SET:
      return action.diff

    case ActionTypes.DIFF__CLEAR:
      return {}

    default:
      return state
  }
}
