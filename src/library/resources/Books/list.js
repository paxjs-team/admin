/**
 *
 * BooksList
 *
 */

import React from 'react'
import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  DeleteButton,
  SearchInput,
} from 'react-admin'
import { Filter } from 'react-admin-patch'

function BooksListFilter(props) {
  return (
    <Filter {...props}>
      <SearchInput source="q" alwaysOn />
    </Filter>
  )
}

export default function BooksList(props) {
  return (
    <List
      {...props}
      title="Books"
      filters={<BooksListFilter />}
      sort={{ field: 'name.en', order: 'ASC' }}
    >
      <Datagrid>
        <DateField />

        <TextField source="name.en" label="Name" />

        <EditButton />

        <DeleteButton />
      </Datagrid>
    </List>
  )
}
