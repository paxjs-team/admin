/**
 *
 * CountryIcon
 *
 */

import React from 'react'
import PropTypes from 'prop-types'

import { CountryIcon as RACountryIcon } from 'react-admin-patch'

export default function CountryIcon({ countryCode }) {
  return <RACountryIcon countryCode={countryCode} />
}

CountryIcon.propTypes = {
  countryCode: PropTypes.string.isRequired,
}
