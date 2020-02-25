/**
 *
 * Components config
 *
 */

import React from 'react'
import {
  List,
  LongTextInput,
  TextInput,
  Edit,
  Create,
  Show,
  DeleteButton,
  DateInput,
  DateField,
  Pagination,
  BulkDeleteButton,
  ReferenceField,
  SimpleForm,
} from 'react-admin'
import {
  TabbedForm,
  ReferenceManyInput,
  ReferenceManyField,
  SelectManyInput,
  DataStructures,
  LocalizedInput,
  EmailInput,
  CheckboxGroupInput,
  CountryGroupInput,
  AutocompleteManyInput,
  GroupInput,
  ManyField,
  FieldList,
  SetResource,
} from 'react-admin-patch'
import RecordPageTitle from '@/app/components/RecordPageTitle'
import DefaultFormActions from '@/app/components/actions/DefaultFormActions'
import { convertEmptyStringToNull } from '@/shared/parsers'
import { requiredFirebaseKeyValidation } from '@/shared/validators'
import translator from '@/shared/utils/translator'
import EditFormToolbar from '@/app/components/EditFormToolbar'

import Domains from '@/app/constants/Domains'
import CountryGroupInputSuggestedCountries from '@/app/constants/CountryGroupInputSuggestedCountries'

import config from 'config'

// Vendor components default props
List.defaultProps.sort = {
  field: 'createdAt',
  order: 'DESC',
}

SimpleForm.defaultProps = {
  ...(SimpleForm.defaultProps || {}),
  toolbar: <EditFormToolbar />,
}

TabbedForm.defaultProps = {
  ...(TabbedForm.defaultProps || {}),
  toolbar: <EditFormToolbar />,
}

BulkDeleteButton.defaultProps.undoable = false

// ReferenceInput.defaultProps = {
//   ...(ReferenceInput.defaultProps || {}),
//   sort: undefined, //
// }

LongTextInput.defaultProps.fullWidth = true
LongTextInput.defaultProps.parse = convertEmptyStringToNull

DateField.defaultProps = {
  ...(DateField.defaultProps || {}),
  source: 'createdAt',
  label: 'Date',
}

DateInput.defaultProps = {
  ...(DateInput.defaultProps || {}),
  parse: convertEmptyStringToNull,
}

ReferenceManyInput.defaultProps = {
  ...(ReferenceManyInput.defaultProps || {}),
  dataStructure: DataStructures.REFERENCE_BOOLEAN_MAP,
}

ReferenceManyField.defaultProps = {
  ...(ReferenceManyField.defaultProps || {}),
  dataStructure: DataStructures.REFERENCE_BOOLEAN_MAP,
}

ManyField.defaultProps = {
  ...(ManyField.defaultProps || {}),
  dataStructure: DataStructures.REFERENCE_BOOLEAN_MAP,
}

FieldList.defaultProps = {
  ...(FieldList.defaultProps || {}),
  dataStructure: DataStructures.REFERENCE_BOOLEAN_MAP,
}

CheckboxGroupInput.defaultProps = {
  ...(CheckboxGroupInput.defaultProps || {}),
  dataStructure: DataStructures.REFERENCE_BOOLEAN_MAP,
}

GroupInput.defaultProps = {
  ...(GroupInput.defaultProps || {}),
  validateKey: requiredFirebaseKeyValidation,
  fullWidth: true,
}

SelectManyInput.defaultProps = {
  ...(SelectManyInput.defaultProps || {}),
  dataStructure: DataStructures.REFERENCE_BOOLEAN_MAP,
}

AutocompleteManyInput.defaultProps = {
  ...(AutocompleteManyInput.defaultProps || {}),
  dataStructure: DataStructures.REFERENCE_BOOLEAN_MAP,
  limitChoicesToValue: true,
  hideSelectedSuggestions: true,
}

TextInput.defaultProps = {
  ...(TextInput.defaultProps || {}),
  fullWidth: true,
  parse: convertEmptyStringToNull,
}

EmailInput.defaultProps = {
  ...(EmailInput.defaultProps || {}),
  domains: Domains,
}

Pagination.defaultProps = {
  ...(Pagination.defaultProps || {}),
  rowsPerPageOptions: [5, 10, 25, 50, 100],
}

CountryGroupInput.defaultProps = {
  ...(CountryGroupInput.defaultProps || {}),
  suggestedCountries: CountryGroupInputSuggestedCountries,
}

Create.defaultProps = {
  ...(Create.defaultProps || {}),
  actions: <DefaultFormActions />,
}

SetResource.defaultProps = {
  ...(SetResource.defaultProps || {}),
  actions: <DefaultFormActions />,
}

Edit.defaultProps = {
  ...(Edit.defaultProps || {}),
  undoable: false,
  actions: <DefaultFormActions />,
}

DeleteButton.defaultProps = {
  undoable: false,
}

LocalizedInput.defaultProps = {
  ...(LocalizedInput.defaultProps || {}),
  locales: config.Internalization.LOCALES,
  translator,
  fullWidth: true,
}

ReferenceField.defaultProps = {
  ...(ReferenceField.defaultProps || {}),
  allowEmpty: true,
}

Edit.Title = RecordPageTitle
Show.Title = RecordPageTitle
