/**
 *
 * React Admin data provider factory
 *
 */

import firebaseDataProvider from 'firebase-data-provider'
// import createAlgoliaDataProvider from 'algolia-data-provider'
import { simpleRestProvider } from 'react-admin-patch'
import firebase from 'firebase/app'
import { fetchUtils } from 'react-admin'
import { pickBy, values } from 'lodash'
import config from 'config'
import DataProviders from '@/app/constants/DataProviders'
import jwtDecode from 'jwt-decode'

function conditionalWait(condition, onFinish, cycles = 40, cycleTime = 50) {
  if (!condition() && cycles > 0) {
    setTimeout(
      () => conditionalWait(condition, onFinish, cycles - 1, cycleTime),
      cycleTime
    )
  } else {
    onFinish()
  }
}

let cachedIdToken

try {
  const persistedIdToken = localStorage.getItem('firebaseToken') // from Auth provider

  const parsedIdToken = jwtDecode(persistedIdToken)

  cachedIdToken = {
    token: persistedIdToken,
    expires: parsedIdToken.exp * 1000,
  }
} catch (err) {
  console.log('error parsing persisted ID token', err)
}

async function _getFirebaseIdTokenAsync() {
  if (cachedIdToken && cachedIdToken.expires > Date.now()) {
    return cachedIdToken.token
  }

  const token = await firebase.auth().currentUser.getIdToken()

  // eslint-disable-next-line
  cachedIdToken = {
    token,
    expires: Date.now() + 5000,
  }

  setTimeout(() => {
    const parsedIdToken = jwtDecode(token)

    cachedIdToken = {
      token,
      expires: parsedIdToken.exp * 1000,
    }
    localStorage.setItem('firebaseToken', token)
  }, 0)

  return token
}

let getFirebaseIdTokenPromise

function getFirebaseIdTokenAsync() {
  if (!getFirebaseIdTokenPromise) {
    getFirebaseIdTokenPromise = _getFirebaseIdTokenAsync()
  }

  getFirebaseIdTokenPromise
    .then(() => {
      getFirebaseIdTokenPromise = null
    })
    .catch(() => {
      getFirebaseIdTokenPromise = null
    })

  return getFirebaseIdTokenPromise
}

const privateApiHttpClient = async (url, options = {}) => {
  let user = firebase.auth().currentUser

  if (!user) {
    await new Promise(resolve =>
      conditionalWait(() => firebase.auth().currentUser, resolve)
    )

    user = firebase.auth().currentUser
  }

  if (!user) {
    return Promise.reject('Athentication is required')
  }

  const token = await getFirebaseIdTokenAsync()

  options.user = {
    authenticated: true,
    token: `Bearer ${token}`,
  }

  return fetchUtils.fetchJson(url, options)
}

function createPrivateDataProvider() {
  const apiUrl = config.PrivateApi.API_URL

  if (!apiUrl) {
    throw new Error('Missing Api url for europe-west1 region')
  }

  const url = apiUrl + '/private'

  return simpleRestProvider(url, privateApiHttpClient)
}

const firebaseConfig = {
  apiKey: config.Firebase.API_KEY,
  authDomain: config.Firebase.AUTH_DOMAIN,
  databaseURL: config.Firebase.DATABASE_URL,
  storageBucket: config.Firebase.STORAGE_BUCKET,
  messagingSenderId: config.Firebase.MESSAGING_SENDER_ID,
  persistence: true,
}

export default function(_resources) {
  // FIX_ME!!!
  // hack to make firebase-data-provider work
  const resources = Object.values(_resources).reduce((out, item) => {
    out[item.name] = item

    return out
  }, {})

  const firebaseRealtimeDatabaseResources = pickBy(
    resources,
    resource =>
      resource.dataProvider.id === DataProviders.FIREBASE_DATA_PROVIDER
  )

  /*const algoliaResources = pickBy(
    resources,
    resource => resource.dataProvider.id === DataProviders.ALGOLIA_DATA_PROVIDER
  )*/

  const firebaseRealtimeDatabaseDataProvider = firebaseDataProvider(
    values(firebaseRealtimeDatabaseResources).map(item => ({
      name: item.name,
      ...item.dataProvider,
    })),
    firebaseConfig
  )

  /*const algoliaDataProvider = createAlgoliaDataProvider({
    appId: config.Algolia.APP_ID,
    apiKey: config.Algolia.API_KEY,
    resources: algoliaResources,
  })*/

  const privateDataProvider = createPrivateDataProvider()

  return async function(type, resourceName, params) {
    const resource =
      resources[resourceName] || resources[resourceName.split('#')[0]]

    if (!resource) {
      throw new Error(`Missing resource ${resourceName}`)
    }

    switch (resource.dataProvider.id) {
      case DataProviders.FIREBASE_DATA_PROVIDER:
        return firebaseRealtimeDatabaseDataProvider(type, resourceName, params)

      case DataProviders.PRIVATE_DATA_PROVIDER:
        return privateDataProvider(type, resource.dataProvider.path, params)

      // case DataProviders.ALGOLIA_DATA_PROVIDER:
      //   return algoliaDataProvider(type, resourceName, params)

      default:
        throw new Error(`Resource ${resourceName} has unknown data provider`)
    }
  }
}
