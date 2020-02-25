/**
 *
 * DataSource
 *
 */

import React from 'react'
import PropTypes from 'prop-types'

import RouteContext from '@/app/routes/RouteContext'
import IconButton from '@material-ui/core/IconButton'

import DataSources from '@/app/constants/DataSources'
import DataProviders from '@/app/constants/DataProviders'

import config from 'config'

import { withStyles } from '@material-ui/core'

const styles = {
  iconContainer: {
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    display: 'block',
    width: 26,
    height: 26,
  },
}

function DataSourceButtonWithoutStyles({ route, location, classes }) {
  if (!route || !route.dataSource) {
    return null
  }

  switch (route.dataSource) {
    case DataSources.FIREBASE_REALTIME_DATABASE:
      return (
        <a
          href={`${config.Firebase.DATABASE_URL}${location.pathname.replace(
            /\/(create|show)$/,
            ''
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Firebase Realtime Database"
        >
          <IconButton>
            <img
              alt="Firebase Realtime Database"
              src={require('assets/icons/firebase-realtime-database.png')}
              className={classes.icon}
            />
          </IconButton>
        </a>
      )

    case DataSources.FIREBASE_AUTH:
      return (
        <a
          href={`https://console.firebase.google.com/project/${config.Firebase.PROJECT_ID}/authentication/users`}
          target="_blank"
          rel="noopener noreferrer"
          title="Firebase Auth"
        >
          <IconButton>
            <img
              alt="Firebase Auth"
              src={require('assets/icons/firebase-auth.png')}
              className={classes.icon}
            />
          </IconButton>
        </a>
      )

    case DataSources.GOOGLE_CLOUD_SQL:
      return (
        <a
          href={`https://console.cloud.google.com/sql/instances?project=${config.Firebase.PROJECT_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Google Cloud SQL"
        >
          <IconButton>
            <img
              alt="Google Cloud SQL"
              src={require('assets/icons/google-cloud-sql.png')}
              className={classes.icon}
            />
          </IconButton>
        </a>
      )

    case DataSources.ALGOLIA: {
      let url

      if (route.dataSourcePath) {
        url = `https://www.algolia.com/apps/${config.Algolia.APP_ID}${route.dataSourcePath}`
      } else if (
        route.dataProvider.id === DataProviders.ALGOLIA_DATA_PROVIDER
      ) {
        url = `https://www.algolia.com/apps/${config.Algolia.APP_ID}/explorer/browse/${route.dataProvider.indexName}`
      }

      if (!url) {
        return (
          <div className={classes.iconContainer} title="Algolia">
            <img
              alt="Algolia"
              src={require('assets/icons/algolia.png')}
              className={classes.icon}
            />
          </div>
        )
      }

      return (
        <a href={url} target="_blank" rel="noopener noreferrer" title="Algolia">
          <IconButton>
            <img
              alt="Algolia"
              src={require('assets/icons/algolia.png')}
              className={classes.icon}
            />
          </IconButton>
        </a>
      )
    }

    case DataSources.GOOGLE_CLOUD_FUNCTIONS_RUNTIME_CODE:
      return (
        <div
          className={classes.iconContainer}
          title="Firebase Functions runtime code"
        >
          <img
            alt="Firebase Functions runtime code"
            src={require('assets/icons/google-cloud-functions.png')}
            className={classes.icon}
          />
        </div>
      )

    case DataSources.PROJECT_SOURCE_CODE:
      return (
        <div
          className={classes.iconContainer}
          title="Project source code at the time of last admin release"
        >
          <img
            alt="Project source code at the time of last admin release"
            src={require('assets/icons/source-code.png')}
            className={classes.icon}
          />
        </div>
      )

    default:
      return null
  }
}

DataSourceButtonWithoutStyles.propTypes = {
  route: PropTypes.object,
  location: PropTypes.object,
  classes: PropTypes.object,
}

const DataSourceButton = withStyles(styles)(DataSourceButtonWithoutStyles)

export default function DataSource() {
  return (
    <RouteContext.Consumer>
      {({ route, location }) => (
        <DataSourceButton route={route} location={location} />
      )}
    </RouteContext.Consumer>
  )
}
