/**
 *
 * reassigns reducer
 *
 */

import ActionTypes from '../ActionTypes'
import { merge } from 'lodash'

export default function(state = {}, action) {
  switch (action.type) {
    case ActionTypes.REASSIGNS__DECLARE:
      return merge({}, state, action.payload)

    case ActionTypes.REASSIGNS__CLEAR:
      return {}

    default:
      return state
  }
}
