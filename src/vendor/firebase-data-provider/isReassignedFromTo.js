import store from './redux/store'

export default function isReassignedFromTo(arvg) {
  const { reassigns } = store.getState()

  if (
    reassigns[arvg.resource] &&
    reassigns[arvg.resource].fromTo[arvg.from] === arvg.to
  ) {
    return true
  }

  return false
}
