/**
 *
 * Books
 *
 */

import list from './list'
import create from './create'
import edit from './edit'
import DataProviders from '@/app/constants/DataProviders'
import DataSources from '@/app/constants/DataSources'
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks'

export default {
  name: 'library/books',
  label: 'Books',
  icon: LibraryBooksIcon,
  list,
  create,
  edit,
  dataProvider: {
    id: DataProviders.FIREBASE_DATA_PROVIDER,
    path: '/library/books',
    dataType: 'collection',
    primaryKey: 'id',
  },
  dataSource: DataSources.FIREBASE_REALTIME_DATABASE,
}
