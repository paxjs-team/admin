import React, { Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { withStyles, createStyles } from '@material-ui/core/styles'
import classnames from 'classnames'
import { SetResourceController } from 'react-admin-patch/ra-core'

import DefaultActions from 'ra-ui-materialui/lib/detail/EditActions'
import TitleForRecord from 'ra-ui-materialui/lib/layout/TitleForRecord'
import CardContentInner from 'ra-ui-materialui/lib/layout/CardContentInner'

export const styles = createStyles({
  root: {
    display: 'flex',
  },
  card: {
    flex: '1 1 auto',
  },
})

const sanitizeRestProps = ({
  actions,
  aside,
  children,
  className,
  crudGetOne,
  crudUpdate,
  data,
  hasCreate,
  hasEdit,
  hasList,
  hasShow,
  id,
  isLoading,
  resetForm,
  resource,
  title,
  translate,
  version,
  match,
  location,
  history,
  options,
  locale,
  permissions,
  undoable,
  ...rest
}) => rest

export const SetResourceView = withStyles(styles)(
  ({
    actions,
    aside,
    basePath,
    children,
    classes,
    className,
    defaultTitle,
    hasList,
    hasShow,
    record,
    redirect,
    resource,
    save,
    title,
    undoable,
    version,
    ...rest
  }) => {
    let viewActions

    if (typeof actions === 'undefined' && hasShow) {
      viewActions = <DefaultActions />
    } else {
      viewActions = actions
    }

    if (!children) {
      return null
    }

    return (
      <div
        className={classnames('edit-page', classes.root, className)}
        {...sanitizeRestProps(rest)}
      >
        <TitleForRecord
          title={title}
          record={record}
          defaultTitle={defaultTitle}
        />

        <Card className={classes.card}>
          {viewActions && (
            <CardContentInner>
              {cloneElement(viewActions, {
                basePath,
                data: record,
                hasShow,
                hasList,
                resource,
                ...viewActions.props,
              })}
            </CardContentInner>
          )}

          {record ? (
            cloneElement(Children.only(children), {
              basePath,
              record,
              redirect: false,
              resource,
              save,
              undoable,
              version,
            })
          ) : (
            <CardContent>&nbsp;</CardContent>
          )}
        </Card>

        {aside &&
          React.cloneElement(aside, {
            basePath,
            record,
            resource,
            version,
          })}
      </div>
    )
  }
)

SetResourceView.propTypes = {
  actions: PropTypes.element,
  aside: PropTypes.node,
  basePath: PropTypes.string,
  children: PropTypes.element,
  classes: PropTypes.object,
  className: PropTypes.string,
  defaultTitle: PropTypes.any,
  hasList: PropTypes.bool,
  hasShow: PropTypes.bool,
  record: PropTypes.object,
  redirect: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  resource: PropTypes.string,
  save: PropTypes.func,
  title: PropTypes.any,
  version: PropTypes.number,
}

SetResourceView.defaultProps = {
  classes: {},
}

const SetResource = props => (
  <SetResourceController {...props}>
    {controllerProps => <SetResourceView {...props} {...controllerProps} />}
  </SetResourceController>
)

SetResource.propTypes = {
  actions: PropTypes.element,
  aside: PropTypes.node,
  children: PropTypes.node,
  classes: PropTypes.object,
  className: PropTypes.string,
  hasCreate: PropTypes.bool,
  hasEdit: PropTypes.bool,
  hasShow: PropTypes.bool,
  hasList: PropTypes.bool,
  resource: PropTypes.string.isRequired,
  title: PropTypes.any,
}

export default SetResource
