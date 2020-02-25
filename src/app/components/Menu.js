/**
 *
 * Menu
 *
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { DashboardMenuItem, MenuItemLink, Responsive } from 'react-admin'
import SubMenu from '@/app/components/SubMenu'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

export default
@withRouter
@connect(state => ({
  open: state.admin.ui.sidebarOpen,
  theme: state.theme,
  locale: state.i18n.locale,
}))
class Menu extends Component {
  static propTypes = {
    onMenuClick: PropTypes.func,
    logout: PropTypes.object,
    open: PropTypes.bool,
    hasDashboard: PropTypes.bool,
    items: PropTypes.array.isRequired,
    location: PropTypes.object.isRequired,
  }

  static defaultProps = {
    items: [],
  }

  constructor(props) {
    super(props)

    const { items, location } = this.props

    let openedSubMenus = {}

    try {
      const persistedOpenedSubMenus = localStorage.getItem('openedSubMenus')

      if (persistedOpenedSubMenus) {
        openedSubMenus = JSON.parse(persistedOpenedSubMenus)
      }
    } catch (err) {
      console.info('Error parsing persisted opened sub menus : ', err)
    }

    const activePath = location.pathname

    items.forEach(item => {
      // menu group
      if (item.items) {
        const hasActiveSubMenu = item.items.some(
          resource =>
            activePath === '/' + resource.name ||
            (activePath.startsWith('/' + resource.name) &&
              !activePath.endsWith('sandbox'))
        )

        if (hasActiveSubMenu) {
          openedSubMenus[item.label] = true
        }
      }
    })

    this.state = {
      openedSubMenus,
    }
  }

  render() {
    const { hasDashboard, onMenuClick, open, logout, items } = this.props
    const { openedSubMenus } = this.state

    return (
      <div>
        {hasDashboard && <DashboardMenuItem onClick={onMenuClick} />}

        {items.map(item => {
          if (item.items) {
            return (
              <SubMenu
                key={item.label}
                onToggle={this._onToggleSubMenu}
                isOpen={openedSubMenus[item.label]}
                sidebarIsOpen={open}
                label={item.label}
                icon={<item.icon />}
              >
                {item.items.map(resource => (
                  <MenuItemLink
                    key={resource.name}
                    to={'/' + resource.name}
                    primaryText={resource.label}
                    onClick={onMenuClick}
                    leftIcon={<resource.icon />}
                  />
                ))}
              </SubMenu>
            )
          }

          return (
            <MenuItemLink
              key={item.name}
              to={'/' + item.name}
              primaryText={item.label}
              onClick={onMenuClick}
              leftIcon={<item.icon />}
            />
          )
        })}

        <Responsive
          small={logout}
          medium={null} // Pass null to render nothing on larger devices
        />
      </div>
    )
  }

  _onToggleSubMenu = groupLabel =>
    this.setState(
      ({ openedSubMenus }) => ({
        openedSubMenus: {
          ...openedSubMenus,
          [groupLabel]: !openedSubMenus[groupLabel],
        },
      }),
      () =>
        localStorage.setItem(
          'openedSubMenus',
          JSON.stringify(this.state.openedSubMenus)
        )
    )
}
