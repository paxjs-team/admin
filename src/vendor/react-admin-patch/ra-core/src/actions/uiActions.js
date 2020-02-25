export function setIsLoading(value) {
  if (value === true) {
    return { type: 'RA/FETCH_START' }
  }

  return { type: 'RA/FETCH_END' }
}
