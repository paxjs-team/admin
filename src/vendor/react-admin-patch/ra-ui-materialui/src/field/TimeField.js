import { get } from 'lodash'

export default function TimeField({ record, hoursSource, minutesSource }) {
  const hours = get(record, hoursSource)
  const minutes = get(record, minutesSource)

  return `${hours}:${minutes}`
}

TimeField.defaultProps = {
  label: 'Time',
}
