/**
 *
 * DefaultFormActions
 *
 */

import React from 'react'

import { CardActions } from 'react-admin'
import ShowFormValuesAction from '@/app/components/actions/ShowFormValuesAction'

export default function DefaultFormActions() {
  return (
    <CardActions>
      <ShowFormValuesAction />
    </CardActions>
  )
}
