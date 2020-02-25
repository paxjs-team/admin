import store from './redux/store'
import recursivelyGetKeyFromKeyMap from './utils/recursivelyGetKeyFromKeyMap'

export default function getRecordFinalId({ id, resource }) {
  const { reassigns } = store.getState()

  if (reassigns[resource]) {
    const finalId = recursivelyGetKeyFromKeyMap(
      reassigns[resource].fromTo,
      id,
      Infinity
    )

    if (finalId) {
      return finalId
    }
  }

  return id
}
