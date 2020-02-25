/**
 *
 * Library
 *
 */

import Books from './resources/Books'
import LocalLibraryIcon from '@material-ui/icons/LocalLibrary'

export default {
  resources: {
    Books,
  },

  menuGroup: {
    label: 'Library',
    icon: LocalLibraryIcon,
    items: [Books],
  },
}
