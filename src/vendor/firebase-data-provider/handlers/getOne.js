/**
 *
 * GET_ONE
 *
 */

import getResourceDataAsync from '../getResourceDataAsync'

export default async function(resource, params) {
  if (params && params.id) {
    const data = await getResourceDataAsync({
      resource: resource.name,
      id: params.id,
    })

    if (data) {
      return { data }
    }
  }
  // Handle SET view
  else if (!params || params.id === undefined) {
    const data = await getResourceDataAsync({
      resource: resource.name,
      watch: true,
    })

    if (data) {
      return {
        data: {
          id: undefined,
          ...data,
        },
      }
    }
  }

  return Promise.reject(new Error('Key not found'))
}
