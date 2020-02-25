import React from 'react'
import PropTypes from 'prop-types'
import ReactAudioPlayer from 'react-audio-player'
import get from 'lodash/get'

export default function AudioField({ source, record = {}, ...rest }) {
  let srcValue = get(record, source)

  if (srcValue instanceof File) {
    srcValue = srcValue.preview
  }

  return (
    <ReactAudioPlayer
      src={srcValue}
      controls
      style={{ height: '40px', marginBottom: '-4px', outline: 'none' }}
      {...rest}
    />
  )
}

AudioField.propTypes = {
  record: PropTypes.object,
  source: PropTypes.string.isRequired,
}
