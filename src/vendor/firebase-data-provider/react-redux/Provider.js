/**
 *
 * Resources Provider
 *
 */

import { createProvider } from 'react-redux'
import store from '../redux/store'

export const storeKey = 'firebase-data-provider-store'

const Provider = createProvider(storeKey)

Provider.defaultProps = { store }

export default Provider
