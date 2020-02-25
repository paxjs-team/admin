/**
 *
 * Menu factory
 *
 */

import React from 'react'
import Menu from '@/app/components/Menu'

export default function menuFactory(originalMenuItems) {
  const menuItems = originalMenuItems.filter(item => {
    if (!item) {
      return false
    }

    // menu group sorting
    if (item.items) {
      item.items = Object.values(item.items)

      item.items.sort(
        (a, b) =>
          (a.menu && a.menu.sortWeight ? a.menu.sortWeight : 0) -
          (b.menu && b.menu.sortWeight ? b.menu.sortWeight : 0)
      )
    }

    return true
  })

  return props => <Menu {...props} items={menuItems} />
}
