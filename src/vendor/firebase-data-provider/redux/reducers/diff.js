/**
 *
 * diff reducer
 *
 */

import ActionTypes from '../ActionTypes'
import { merge } from 'lodash'

export default function(state = {}, action) {
  switch (action.type) {
    case ActionTypes.DIFF__UPDATE:
      return merge({}, state, action.diff)

    case ActionTypes.DIFF__CLEAR:
      return {}

    default:
      return state
  }
}
