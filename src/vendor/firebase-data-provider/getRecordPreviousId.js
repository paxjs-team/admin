import store from './redux/store'
import recursivelyGetKeyFromKeyMap from './utils/recursivelyGetKeyFromKeyMap'

export default function getRecordPreviousId({
  id,
  resource,
  depth = Infinity,
}) {
  const { reassigns } = store.getState()

  if (reassigns[resource]) {
    const previousId = recursivelyGetKeyFromKeyMap(
      reassigns[resource].toFrom,
      id,
      depth
    )

    if (previousId) {
      return previousId
    }
  }

  return id
}
