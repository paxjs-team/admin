import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import 'flag-icon-css/css/flag-icon.css'

const styles = {
  squaredIcon: {
    fontSize: 15,
  },

  activeSquaredIcon: {
    fontSize: 22,
  },

  roundedIcon: {
    borderRadius: '50%',
    backgroundSize: 'cover',
    height: '1.3em',
    backgroundPosition: 'center center',
    fontSize: 15,
  },

  activeRoundedIcon: {
    borderRadius: '50%',
    backgroundSize: 'cover',
    height: '1.3em',
    backgroundPosition: 'center center',
    fontSize: 22,
  },
}

function CountryIcon({ countryCode, isActive, classes, className, shape }) {
  if (countryCode) {
    return (
      <span
        className={`flag-icon flag-icon-${countryCode.toLowerCase()} ${
          isActive
            ? shape === 'circle'
              ? classes.activeRoundedIcon
              : classes.activeSquaredIcon
            : shape === 'circle'
            ? classes.roundedIcon
            : classes.squaredIcon
        } ${className}`}
      />
    )
  }

  return null
}

CountryIcon.propTypes = {
  shape: PropTypes.string,
  className: PropTypes.string,
  countryCode: PropTypes.string,
  isActive: PropTypes.bool,
  classes: PropTypes.object,
}

export default withStyles(styles)(CountryIcon)
