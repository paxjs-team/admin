/**
 *
 * React Admin auth provider
 *
 */

import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_CHECK } from 'react-admin'
import firebase from 'firebase/app'
import 'firebase/auth'

function isValidEmail(email) {
  /* eslint-disable */
  const emailRegExp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i

  /* eslint-enable */
  return emailRegExp.test(email)
}

// eslint-disable-next-line
function isValidMSISDN(msisdn) {
  const msisdnRegExp = /^\+[1-9]{1,3}\d{7,14}$/

  return msisdnRegExp.test(msisdn)
}

export default async (type, params) => {
  let authIsInitialised = false

  firebase.auth().onAuthStateChanged(() => {
    if (!authIsInitialised) {
      authIsInitialised = true
    }
  })

  switch (type) {
    case AUTH_LOGOUT:
      localStorage.removeItem('firebaseToken')

      return firebase.auth().signOut()

    case AUTH_CHECK: {
      return new Promise((resolve, reject) => {
        const authIsInitialisedPrevValue = authIsInitialised

        const checkAuth = () => {
          if (authIsInitialised !== authIsInitialisedPrevValue) {
            if (firebase.auth().currentUser) {
              resolve()
            } else {
              reject(new Error('User not found'))
            }
          } else {
            setTimeout(checkAuth, 20)
          }
        }

        setTimeout(checkAuth, 20)
      })
    }

    case AUTH_LOGIN: {
      const { providerId, username, password = '', token } = params

      if (providerId === 'password') {
        if (!isValidEmail(username)) {
          return Promise.reject(new Error('Not valid email!'))
        }

        if (password.length < 8) {
          return Promise.reject(
            new Error('Password should be minimum 8 characters!')
          )
        }
      }

      const adminsSnap = await firebase
        .database()
        .ref('/admins')
        .once('value')

      if (adminsSnap.exists()) {
        const admins = adminsSnap.val()
        let userId = null

        Object.keys(admins).forEach(key => {
          if (admins[key] === username) {
            userId = key
          }
        })

        if (admins[userId] !== username) {
          return Promise.reject(
            new Error('You are not one of the administrators!')
          )
        }
        try {
          let provider, credential

          if (providerId === 'facebook.com' && token) {
            provider = firebase.auth.FacebookAuthProvider
            credential = provider.credential(token)
          } else if (providerId === 'password' && username && password) {
            provider = firebase.auth.EmailAuthProvider
            credential = provider.credential(username, password)
          }

          if (provider && credential) {
            let auth

            try {
              auth = await firebase.auth().signInWithCredential(credential)
            } catch (err) {
              console.log('err', err)

              if (err.code === 'auth/user-not-found') {
                if (providerId === 'password') {
                  auth = await firebase
                    .auth()
                    .createUserWithEmailAndPassword(username, password)
                }
              }

              return Promise.reject(err)
            }

            if (!auth.user.emailVerified) {
              auth.user.sendEmailVerification()

              firebase.auth().signOut()

              return Promise.reject(
                new Error(
                  'Email is not verified! We sent you a letter with instructions how to do it.'
                )
              )
            }

            const firebaseToken = await auth.user.getIdToken()

            localStorage.setItem('firebaseToken', firebaseToken)

            return Promise.resolve()
          }

          return Promise.reject(new Error('Not valid credentials!'))
        } catch (err) {
          console.info('err: ', err)

          if (err.code === 'auth/wrong-password') {
            return Promise.reject(new Error('Wrong password!'))
          }

          return Promise.reject(new Error('Sorry, something went wrong...'))
        }
      } else {
        return Promise.reject(
          new Error('You are not one of the administrators!')
        )
      }
    }

    default:
      return Promise.resolve()
  }
}
