/**
 *
 * PatchedSaveButton
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { SaveButton } from 'react-admin'

function PatchedSaveButton({ dispatch, loading, ...rest }) {
  return <SaveButton {...rest} disabled={loading} />
}

PatchedSaveButton.propTypes = {
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
}

function mapStateToProps(state) {
  return {
    loading: Boolean(state.admin.loading),
  }
}

export default connect(mapStateToProps)(PatchedSaveButton)
