import React, { Children, Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {
  reduxForm,
  getFormAsyncErrors,
  getFormSyncErrors,
  getFormSubmitErrors,
} from 'redux-form'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import compose from 'recompose/compose'
import Divider from '@material-ui/core/Divider'
import Tabs from '@material-ui/core/Tabs'
import { withStyles } from '@material-ui/core/styles'
import { getDefaultValues, translate, REDUX_FORM_NAME } from 'ra-core'

import Toolbar from 'ra-ui-materialui/lib/form/Toolbar'
import CardContentInner from 'ra-ui-materialui/lib/layout/CardContentInner'

const styles = theme => ({
  errorTabButton: { color: theme.palette.error.main },
  hidden: { display: 'none' },
})

const sanitizeRestProps = ({
  anyTouched,
  array,
  asyncBlurFields,
  asyncValidate,
  asyncValidating,
  autofill,
  blur,
  change,
  clearAsyncError,
  clearFields,
  clearSubmit,
  clearSubmitErrors,
  destroy,
  dirty,
  dispatch,
  form,
  handleSubmit,
  initialize,
  initialized,
  initialValues,
  pristine,
  pure,
  redirect,
  reset,
  resetSection,
  save,
  staticContext,
  submit,
  submitFailed,
  submitSucceeded,
  submitting,
  touch,
  translate,
  triggerSubmit,
  untouch,
  valid,
  validate,
  ...props
}) => props

export class TabbedForm extends Component {
  handleSubmitWithRedirect = (redirect = this.props.redirect) =>
    this.props.handleSubmit(values => this.props.save(values, redirect))

  render() {
    const {
      basePath,
      children,
      className,
      classes = {},
      invalid,
      location,
      match,
      pristine,
      record,
      redirect,
      resource,
      saving,
      submitOnEnter,
      tabsWithErrors,
      toolbar,
      translate,
      value,
      version,
      ...rest
    } = this.props

    const validTabsValues = Children.toArray(children).map((tab, index) =>
      tab.props.path
        ? '#' + tab.props.path
        : index === 0
        ? ''
        : '#' + String(index)
    )

    // This ensure we don't get warnings from material-ui Tabs component when
    // the current location pathname targets a dynamically added Tab
    // In the case the targeted Tab is not present at first render (when
    // using permissions for example) we temporarily switch to the first
    // available tab. The current location will be applied again on the
    // first render containing the targeted tab. This is almost transparent
    // for the user who may just see an short tab selection animation
    const tabsValue = validTabsValues.includes(location.hash)
      ? location.hash
      : ''

    return (
      <form
        className={classnames('tabbed-form', className)}
        key={version}
        {...sanitizeRestProps(rest)}
      >
        <Tabs
          // The location pathname will contain the page path including the current tab path
          // so we can use it as a way to determine the current tab
          value={tabsValue}
          indicatorColor="primary"
        >
          {Children.map(children, tab => {
            if (!tab) {
              return null
            }

            const value = tab.props.path ? '#' + tab.props.path : ''

            return React.cloneElement(tab, {
              context: 'header',
              value,
              to: {
                pathname: match.url,
                hash: value,
                state: { skipFormReset: true },
              },
              className:
                tabsWithErrors.includes(tab.props.label) &&
                location.hash !== value
                  ? classes.errorTabButton
                  : null,
            })
          })}
        </Tabs>
        <Divider />
        <CardContentInner>
          {/* All tabs are rendered (not only the one in focus), to allow validation
                    on tabs not in focus. The tabs receive a `hidden` property, which they'll
                    use to hide the tab using CSS if it's not the one in focus.
                    See https://github.com/marmelab/react-admin/issues/1866 */}
          {Children.map(children, tab =>
            tab &&
            location.hash === (tab.props.path ? '#' + tab.props.path : '') ? (
              <div>{tab}</div>
            ) : (
              <div className={classes.hidden}>{tab}</div>
            )
          )}
        </CardContentInner>

        {toolbar &&
          React.cloneElement(toolbar, {
            basePath,
            className: 'toolbar',
            handleSubmitWithRedirect: this.handleSubmitWithRedirect,
            handleSubmit: this.props.handleSubmit,
            invalid,
            pristine,
            record,
            redirect,
            resource,
            saving,
            submitOnEnter,
          })}
      </form>
    )
  }
}

TabbedForm.propTypes = {
  basePath: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  classes: PropTypes.object,
  defaultValue: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  handleSubmit: PropTypes.func, // passed by redux-form
  invalid: PropTypes.bool,
  location: PropTypes.object,
  match: PropTypes.object,
  pristine: PropTypes.bool,
  record: PropTypes.object,
  redirect: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.func,
  ]),
  resource: PropTypes.string,
  save: PropTypes.func, // the handler defined in the parent, which triggers the REST submission
  saving: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  submitOnEnter: PropTypes.bool,
  tabsWithErrors: PropTypes.arrayOf(PropTypes.string),
  toolbar: PropTypes.element,
  translate: PropTypes.func,
  validate: PropTypes.func,
  value: PropTypes.number,
  version: PropTypes.number,
}

TabbedForm.defaultProps = {
  submitOnEnter: true,
  toolbar: <Toolbar />,
}

const collectErrors = (state, props) => {
  const syncErrors = getFormSyncErrors(props.form)(state)
  const asyncErrors = getFormAsyncErrors(props.form)(state)
  const submitErrors = getFormSubmitErrors(props.form)(state)

  return {
    ...syncErrors,
    ...asyncErrors,
    ...submitErrors,
  }
}

export const findTabsWithErrors = (
  state,
  props,
  collectErrorsImpl = collectErrors
) => {
  const errors = collectErrorsImpl(state, props)

  return Children.toArray(props.children).reduce((acc, child) => {
    const inputs = Children.toArray(child.props.children)

    if (inputs.some(input => errors[input.props.source])) {
      return [...acc, child.props.label]
    }

    return acc
  }, [])
}

const enhance = compose(
  withRouter,
  connect((state, props) => {
    const children = Children.toArray(props.children).reduce(
      (acc, child) => [...acc, ...Children.toArray(child.props.children)],
      []
    )

    return {
      form: props.form || REDUX_FORM_NAME,
      initialValues: getDefaultValues(state, { ...props, children }),
      saving: props.saving || state.admin.saving,
      tabsWithErrors: findTabsWithErrors(state, {
        form: REDUX_FORM_NAME,
        ...props,
      }),
    }
  }),
  translate, // Must be before reduxForm so that it can be used in validation
  reduxForm({
    destroyOnUnmount: false,
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
  }),
  withStyles(styles)
)

export default enhance(TabbedForm)
