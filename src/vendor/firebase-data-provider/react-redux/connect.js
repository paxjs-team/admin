/**
 *
 * Resources react-redux connector
 *
 */

import { connect } from 'react-redux'
import { storeKey } from './Provider'

export default function(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  options = {}
) {
  options.storeKey = storeKey

  let patchedMapStateToProps

  if (mapStateToProps) {
    patchedMapStateToProps = (state, props) =>
      mapStateToProps(state.resources, props)
  }

  return connect(
    patchedMapStateToProps,
    mapDispatchToProps,
    mergeProps,
    options
  )
}
