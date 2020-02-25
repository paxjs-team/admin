import 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import firebaseDataProvider from './firebaseDataProvider'
export { default as ResourcesProvider } from './react-redux/Provider'
export { default as connectResources } from './react-redux/connect'
export { default as uploadFile } from './utils/uploadFile'
export { default as removeFile } from './utils/removeFile'
export default firebaseDataProvider
