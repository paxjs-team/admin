import store from './redux/store'

export default function isRecordReassigned({ id, resource }) {
  const { reassigns } = store.getState()

  if (reassigns[resource] && reassigns[resource].fromTo[id]) {
    return true
  }

  return false
}
