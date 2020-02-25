/**
 *
 * Remove file util
 *
 */

import firebase from 'firebase/app'

export default async function removeFile(uri) {
  const storage = firebase.storage()
  const storageBucket = storage.bucket_.bucket

  if (uri.includes(storageBucket)) {
    const fileStoragePath = decodeURIComponent(
      uri.split(/[?#]/)[0].match(/[^/]*$/)[0]
    )

    try {
      await storage
        .ref()
        .child(fileStoragePath)
        .delete()
    } catch (err) {
      if (err.code !== 'storage/object-not-found') {
        return Promise.reject(err)
      }
    }
  }
}
