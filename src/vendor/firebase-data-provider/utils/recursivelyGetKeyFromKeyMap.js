export default function recursivelyGetKeyFromKeyMap(
  keyMap,
  key,
  recursionDepth
) {
  const mappedKey = keyMap[key]

  if (recursionDepth !== 0 && keyMap[mappedKey]) {
    return recursivelyGetKeyFromKeyMap(
      keyMap,
      mappedKey,
      recursionDepth !== Infinity ? recursionDepth - 1 : recursionDepth
    )
  }

  return mappedKey
}
