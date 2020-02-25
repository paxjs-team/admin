import React from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import CountryIcon from '../input/LocalizedInput/CountryIcon'
import { withStyles } from '@material-ui/core/styles'
import countries from 'i18n-iso-countries'
countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

const styles = {
  container: {
    display: 'block',
    padding: 5,
  },

  textWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    marginRight: 10,
    fontSize: 20,
  },

  countryName: {
    whiteSpace: 'nowrap',
  },
}

function CountryField({ source, record, classes }) {
  const countryCode = get(record, source)

  if (!countryCode) {
    return null
  }

  return (
    <div className={classes.container}>
      <div className={classes.textWrapper}>
        <CountryIcon countryCode={countryCode} className={classes.icon} />

        <span className={classes.countryName}>
          {countries.getName(countryCode, 'en')}
        </span>
      </div>
    </div>
  )
}

CountryField.propTypes = {
  classes: PropTypes.object,
  record: PropTypes.object,
  source: PropTypes.string.isRequired,
}

export default withStyles(styles)(CountryField)
