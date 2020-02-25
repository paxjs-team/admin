/**
 *
 * Upload file util
 *
 */

import firebase from 'firebase/app'
import moment from 'moment'

export default async function uploadFile(file, bucket = '') {
  const storageRef = firebase.storage().ref()

  const fileName = file.name.split('.').reduce((out, str, index) => {
    if (index === 0) {
      return out + str + ' ' + moment().toISOString()
    }

    if (index === 1) {
      return out + '.' + str
    }

    return out
  }, '')

  let fileType = 'files'

  if (isImageFile(file.type)) {
    fileType = 'images'
  } else if (isAudioFile(file.type)) {
    fileType = 'audio'
  }

  const fileRef = storageRef.child(`${bucket}/${fileType}/${fileName}`)

  const snap = await fileRef.put(file)

  return snap.ref.getDownloadURL()
}

function isImageFile(fileType) {
  return /image/g.test(fileType)
}

function isAudioFile(fileType) {
  return /audio/g.test(fileType)
}
