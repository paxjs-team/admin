/**
 *
 * Firebase data provider
 *
 */

import { GET_LIST, GET_MANY, GET_ONE } from 'react-admin'
import algoliasearch from 'algoliasearch'
import keys from 'lodash/keys'
import pick from 'lodash/pick'
import omit from 'lodash/omit'

export default function createAlgoliaDataProvider({
  appId,
  apiKey,
  resources,
}) {
  const algoliaClient = algoliasearch(appId, apiKey)
  const indixes = {}

  return async (type, resourceName, params) => {
    switch (type) {
      case GET_LIST: {
        if (resourceName.includes('#')) {
          const [indexName, facet] = resourceName.split('#')

          return facetDataProvider(type, indexName, facet, params)
        }

        const index = getIndex(resourceName)

        const filters = params.filter
          ? keys(omit(params.filter, 'q'))
              .map(facet =>
                params.filter[facet]
                  .map(value => `${facet}:${value}`)
                  .join(' OR ')
              )
              .join(' AND ')
          : undefined

        return index
          .search({
            query: params.filter.q,
            page: params.pagination.page - 1,
            hitsPerPage: params.pagination.perPage,
            filters,
          })
          .then(result => {
            result.hits.forEach(item => {
              item.id = item.id || item.objectID
            })

            return { data: result.hits, total: result.nbHits }
          })
          .catch(err => {
            console.info('[algolia-data-provider] Error: ', err)

            // Index doesn't exist
            if (err.statusCode === 404) {
              return { data: [], total: 0 }
            }

            return Promise.reject(err)
          })
      }

      case GET_ONE: {
        if (resourceName.includes('#')) {
          const [indexName, facet] = resourceName.split('#')

          return facetDataProvider(type, indexName, facet, params)
        }

        const index = getIndex(resourceName)

        const data = await index.getObject(params.id)

        data.id = data.objectID

        return { data }
      }

      case GET_MANY: {
        if (resourceName.includes('#')) {
          const [indexName, facet] = resourceName.split('#')

          return facetDataProvider(type, indexName, facet, params)
        }

        const index = getIndex(resourceName)

        const result = await index.getObjects(params.ids)

        const data = []

        result.results.forEach(item => {
          if (item) {
            item.id = item.objectID

            data.push(item)
          }
        })

        return { data }
      }

      default:
        console.error('Undocumented method: ', type)

        return { data: [] }
    }
  }

  async function facetDataProvider(type, indexName, facet, params) {
    const index = getIndex(indexName)

    try {
      switch (type) {
        case GET_LIST: {
          if (params.filter.q) {
            // max number of hits is 10 for this Api
            const result = await index.searchForFacetValues({
              facetName: facet,
              facetQuery: params.filter.q,
            })

            const data = result.facetHits.map(hit => ({
              id: hit.value,
              count: hit.count,
            }))

            return { data, total: data.length }
          }

          const result = await index.search({
            hitsPerPage: 0,
            facets: [facet],
          })

          const facetData = result.facets[facet]

          const data = keys(facetData).map(facetValue => {
            const facetValueTotalItems = facetData[facetValue]

            return {
              id: facetValue,
              count: facetValueTotalItems,
            }
          })

          return {
            data:
              data.length > params.pagination.perPage
                ? data.slice(0, params.pagination.perPage)
                : data,
            total: data.length,
          }
        }

        case GET_MANY: {
          const result = await index.search({
            hitsPerPage: 0,
            facets: [facet],
          })

          const facetData = result.facets[facet]

          const matchedData = pick(facetData, params.ids)

          const data = keys(matchedData).map(facetValue => {
            const facetValueTotalItems = result.facets[facet][facetValue]

            return {
              id: facetValue,
              count: facetValueTotalItems,
            }
          })

          return {
            data,
            ids: params.ids,
            total: data.length,
          }
        }

        default:
          console.error('Undocumented method: ', type)

          return { data: [], total: 0 }
      }
    } catch (err) {
      console.info('[algolia-data-provider] Error: ', err)

      // Index doesn't exist
      if (err.statusCode === 404) {
        return { data: [], total: 0 }
      }

      return Promise.reject(err)
    }
  }

  function getIndex(resourceName) {
    const resource = resources[resourceName]

    if (!resource) {
      throw new Error(`Missing resource ${resourceName}`)
    }

    const { dataProvider } = resource

    if (!dataProvider) {
      throw new Error(`Missing resource ${resourceName} data provider config`)
    }

    const { indexName } = dataProvider

    let index = indixes[indexName]

    if (!index) {
      index = algoliaClient.initIndex(indexName)
      indixes[indexName] = index
    }

    return index
  }
}
