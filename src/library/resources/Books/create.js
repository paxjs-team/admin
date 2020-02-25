/**
 *
 * BooksCreate
 *
 */

import React from 'react'

import { Create, SimpleForm, TextInput } from 'react-admin'
import { SelectInput, LocalizedInput } from 'react-admin-patch'

import CountryChoices from '@/shared/choices/CountryChoices'

import { requiredFieldValidation } from '@/shared/validators'

export default function BooksCreate(props) {
  return (
    <Create {...props} title="Create Book">
      <SimpleForm>
        <LocalizedInput source="name">
          <TextInput label="Name" validate={requiredFieldValidation} />
        </LocalizedInput>

        <LocalizedInput source="description">
          <TextInput label="Description" />
        </LocalizedInput>

        <SelectInput source="country" choices={CountryChoices} />
      </SimpleForm>
    </Create>
  )
}
