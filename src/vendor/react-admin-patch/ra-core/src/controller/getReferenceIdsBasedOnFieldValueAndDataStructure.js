import * as DataStructures from '../DataStructures'

export default function getReferenceIdsBasedOnFieldValueAndDataStructure(
  inputValue,
  inputDataStructure
) {
  if (inputValue) {
    if (inputDataStructure === DataStructures.REFERENCE_LIST) {
      return inputValue
    }

    if (inputDataStructure.endsWith('MAP')) {
      return Object.keys(inputValue).filter(id => inputValue[id] !== null)
    }
  }

  return []
}
