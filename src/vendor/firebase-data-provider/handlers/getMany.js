/**
 *
 * GET_MANY
 *
 */

import getResourceDataAsync from '../getResourceDataAsync'

export default async function(resource, params) {
  if (!params.ids) {
    console.error('Unexpected parameters: ', params)

    return Promise.reject(new Error('Error processing request'))
  }

  let ids = [],
    data = [],
    total = 0

  const resourceData = await getResourceDataAsync({ resource: resource.name })

  params.ids.forEach(key => {
    if (resourceData[key]) {
      ids.push(key)
      data.push(resourceData[key])
      total++
    }
  })

  return { data, ids, total }
}
