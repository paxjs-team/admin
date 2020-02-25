/**
 *
 * Layout
 *
 */

import React from 'react'

import { Layout } from 'react-admin'
import AppBar from '@/app/components/AppBar'
import { RouteContextProvider } from '@/app/routes/RouteContext'

export default function CustomLayout(props) {
  return (
    <RouteContextProvider>
      <Layout {...props} appBar={AppBar} />
    </RouteContextProvider>
  )
}
