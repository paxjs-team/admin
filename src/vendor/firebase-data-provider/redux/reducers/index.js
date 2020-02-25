/**
 *
 * Reducers
 *
 */

import { combineReducers } from 'redux'
import resources from './resources'
import listeners from './listeners'
import diff from './diff'
import reassigns from './reassigns'
import beforeActionDiff from './beforeActionDiff'

export default combineReducers({
  resources,
  listeners,
  diff,
  beforeActionDiff,
  reassigns,
})
