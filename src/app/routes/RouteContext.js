/**
 *
 * ResourcesContext
 *
 */

import React, { createContext } from 'react'
import PropTypes from 'prop-types'

import { withRouter } from 'react-router-dom'

import { resources, pages } from '@/app/routes'

const RouteContext = createContext()

export default RouteContext

const resourceList = Object.values(resources)
const resourcePathnameList = resourceList.map(item => '/' + item.name)
const pageList = Object.values(pages)
const pagePathnameList = pageList.map(item => '/' + item.name)

function RouteContextProviderWithoutRouter(props) {
  let route = null

  const pathname = props.location.pathname

  for (let i = 0; i < resourcePathnameList.length; i++) {
    if (
      pathname === resourcePathnameList[i] ||
      pathname.startsWith(resourcePathnameList[i] + '/')
    ) {
      route = resourceList[i]

      break
    }
  }

  if (!route) {
    for (let i = 0; i < pagePathnameList.length; i++) {
      if (
        pathname === pagePathnameList[i] ||
        pathname.startsWith(pagePathnameList[i] + '/')
      ) {
        route = pageList[i]

        break
      }
    }
  }

  return (
    <RouteContext.Provider value={{ route, location: props.location }}>
      {props.children}
    </RouteContext.Provider>
  )
}

RouteContextProviderWithoutRouter.propTypes = {
  children: PropTypes.any,
  location: PropTypes.object,
}

export const RouteContextProvider = withRouter(
  RouteContextProviderWithoutRouter
)
