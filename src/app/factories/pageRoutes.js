/**
 *
 * pageRoutes factory
 *
 */

import React from 'react'
import { Route } from 'react-router-dom'

export default function pageRoutesFactory(pages) {
  return Object.values(pages).map(item => (
    <Route
      key={item.name}
      exact
      path={item.path || `/${item.name}`}
      component={item.page}
    />
  ))
}
