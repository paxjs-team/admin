/**
 *
 * BooksEdit
 *
 */

import React from 'react'

import { Edit, SimpleForm, SelectInput, TextInput } from 'react-admin'
import { LocalizedInput } from 'react-admin-patch'

import CountryChoices from '@/shared/choices/CountryChoices'

import { requiredFieldValidation } from '@/shared/validators'

export default function BooksEdit(props) {
  return (
    <Edit {...props} title={<Edit.Title prefix="Book" identifier="name.en" />}>
      <SimpleForm>
        <LocalizedInput source="name">
          <TextInput label="Name" validate={requiredFieldValidation} />
        </LocalizedInput>

        <LocalizedInput source="description">
          <TextInput label="Description" />
        </LocalizedInput>

        <SelectInput source="country" choices={CountryChoices} />
      </SimpleForm>
    </Edit>
  )
}
