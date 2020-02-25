/**
 *
 * runUpdates
 *
 */

import firebase from 'firebase/app'
import { isEmpty, values } from 'lodash'
import uploadFile from './utils/uploadFile'
import removeFile from './utils/removeFile'

export default async function runUpdates({
  databaseDiff,
  filesToAdd,
  filesToRemove,
}) {
  const uploadedFiles = []

  if (filesToAdd && !isEmpty(filesToAdd)) {
    await Promise.all(
      Object.keys(filesToAdd).map(databaseLocation => {
        const file = filesToAdd[databaseLocation]

        return uploadFile(file.uri, file.resource).then(storageUrl => {
          file.uri = storageUrl
          delete file.resource

          uploadedFiles.push(storageUrl)

          databaseDiff[databaseLocation] = file
        })
      })
    )
  }

  try {
    await firebase
      .database()
      .ref()
      .update(databaseDiff)
  } catch (err) {
    await Promise.all(uploadedFiles.map(uri => removeFile(uri)))

    return Promise.reject(err)
  }

  if (filesToRemove && !isEmpty(filesToRemove)) {
    await Promise.all(
      values(filesToRemove)
        .map(file => file.uri)
        .map(uri => removeFile(uri))
    )
  }
}
