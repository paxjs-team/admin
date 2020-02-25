/**
 *
 * EnvironmentField
 *
 */

import React from 'react'
import PropTypes from 'prop-types'

import { SelectField } from 'react-admin'

import EnvironmentChoices from '@/shared/choices/EnvironmentChoices'

import themes from '@/app/styles/themes'

export default function EnvironmentField({ record, resource }) {
  return (
    <div
      style={{
        backgroundColor: themes[record.environment],
        padding: 10,
        borderRadius: 3,
      }}
    >
      <SelectField
        source="environment"
        choices={EnvironmentChoices}
        record={record}
        resource={resource}
        style={{ color: 'white', textAlign: 'center' }}
      />
    </div>
  )
}

EnvironmentField.propTypes = {
  record: PropTypes.object,
  resource: PropTypes.string,
}

EnvironmentField.defaultProps = {
  label: 'Environment',
}
