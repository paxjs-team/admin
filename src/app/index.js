/**
 *
 * App
 *
 */

import '@/app/styles'
import '@/app/componentsConfig'

import React from 'react'

import { Admin } from 'react-admin'
import Dashboard from '@/app/components/Dashboard'
import LoginPage from '@/app/components/LoginPage'
import Layout from '@/app/components/Layout'
import { LocalizedInputContextProvider } from 'react-admin-patch'

import { resources, pages, menuItems } from '@/app/routes'

import authProvider from '@/app/authProvider'

import dataProviderFactory from '@/app/factories/dataProvider'
import menuFactory from '@/app/factories/Menu'
import resourceRoutesFactory from '@/app/factories/resourceRoutes'
import pageRoutesFactory from '@/app/factories/pageRoutes'
import { createBrowserHistory } from 'history'

const dataProvider = dataProviderFactory(resources)
const resourceRoutes = resourceRoutesFactory(resources)
const pageRoutes = pageRoutesFactory(pages)
const Menu = menuFactory(menuItems)
const history = createBrowserHistory()

export default function App() {
  return (
    <LocalizedInputContextProvider>
      <Admin
        dataProvider={dataProvider}
        history={history}
        title="Admin Demo"
        authProvider={authProvider}
        customRoutes={pageRoutes}
        loginPage={LoginPage}
        dashboard={Dashboard}
        appLayout={Layout}
        menu={Menu}
      >
        {resourceRoutes}
      </Admin>
    </LocalizedInputContextProvider>
  )
}
