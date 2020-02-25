/**
 *
 * AppBar
 *
 */

import React from 'react'
import PropTypes from 'prop-types'

import { AppBar } from 'react-admin'
import Typography from '@material-ui/core/Typography'
import DataSource from '@/app/components/DataSource'
import Brand from '@/app/components/Brand'

import config from 'config'

import themes from '@/app/styles/themes'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  appBar: {
    backgroundColor: themes[config.ENVIRONMENT],
  },

  container: {
    position: 'relative',
    height: 48,
    width: 'calc(100vw - 192px)',
  },

  title: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    width: 'calc((100% - 48px) / 2)',
  },

  brandContainer: {
    position: 'absolute',
    top: 0,
    left: 48,
    right: 0,
    bottom: 0,
    zIndex: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sidesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  spacer: {
    flex: 1,
    height: 48,
  },

  brand: {
    marginLeft: 48,
  },
}

function CustomAppBar({ classes, ...props }) {
  return (
    <AppBar {...props} style={styles.appBar}>
      <div className={classes.container}>
        <div className={classes.brandContainer}>
          <Brand />
        </div>

        <div className={classes.sidesContainer}>
          <Typography
            variant="title"
            color="inherit"
            className={classes.title}
            id="react-admin-title"
          />

          <span className={classes.spacer} />

          <DataSource />
        </div>
      </div>
    </AppBar>
  )
}

CustomAppBar.propTypes = {
  classes: PropTypes.object,
}

export default withStyles(styles)(CustomAppBar)
