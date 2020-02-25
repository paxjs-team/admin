import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'redux-form'
import IconButton from '@material-ui/core/IconButton'
import ActionHide from '@material-ui/icons/HighlightOff'
import classnames from 'classnames'
import { translate } from 'ra-core'
import { DataStructures } from 'react-admin-patch'

const emptyRecord = {}

const sanitizeRestProps = ({ alwaysOn, ...props }) => props

const FilterFormInput = ({
  filterElement,
  handleHide,
  classes,
  resource,
  translate,
}) => {
  let element

  if (
    filterElement.props.dataStructure !== undefined &&
    filterElement.props.dataStructure !== DataStructures.REFERENCE_LIST
  ) {
    element = React.cloneElement(filterElement, {
      dataStructure: DataStructures.REFERENCE_LIST,
    })
  } else {
    element = filterElement
  }

  return (
    <div
      data-source={element.props.source}
      className={classnames('filter-field', classes.body)}
    >
      {!element.props.alwaysOn && (
        <IconButton
          className="hide-filter"
          onClick={handleHide}
          data-key={element.props.source}
          tooltip={translate('ra.action.remove_filter')}
        >
          <ActionHide />
        </IconButton>
      )}
      <Field
        allowEmpty
        {...sanitizeRestProps(element.props)}
        name={element.props.source}
        component={element.type}
        resource={resource}
        record={emptyRecord}
      />
      <div className={classes.spacer}>&nbsp;</div>
    </div>
  )
}

FilterFormInput.propTypes = {
  filterElement: PropTypes.node,
  handleHide: PropTypes.func,
  classes: PropTypes.object,
  resource: PropTypes.string,
  translate: PropTypes.func,
}

export default translate(FilterFormInput)
