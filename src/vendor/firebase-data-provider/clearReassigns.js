import store from './redux/store'
import { clearReassigns } from './redux/actionCreators'

export default function() {
  store.dispatch(clearReassigns())
}
