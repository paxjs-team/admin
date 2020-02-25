const firebaseKey = require('firebase-key')

export default function generateFirebaseRandomKey() {
  return firebaseKey.key()
}
