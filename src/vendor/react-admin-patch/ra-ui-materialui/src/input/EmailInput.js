import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { addField, FieldTitle } from 'ra-core'

import sanitizeRestProps from 'ra-ui-materialui/lib/input/sanitizeRestProps'

import MuiTextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  usernameInput: {
    width: theme.spacing.unit * 20,
    textAlign: 'right',
  },
  domainInput: {
    width: theme.spacing.unit * 20,
    marginLeft: -14,
    '&>div': {
      paddingLeft: 14,
    },
  },
})

class EmailInput extends Component {
  constructor(props) {
    super(props)

    let username = '',
      domain = ''

    if (props.input.value && props.input.value.includes('@')) {
      ;[username, domain] = props.input.value.split('@')
    }

    if (domain) {
      this.initialDomainValue = domain
    }

    this.state = {
      username,
      domain,
    }
  }

  handleBlur = eventOrValue => {
    this.props.onBlur(eventOrValue)
    this.props.input.onBlur(eventOrValue)
  }

  handleFocus = event => {
    this.props.onFocus(event)
    this.props.input.onFocus(event)
  }

  handleChange = eventOrValue => {
    this.props.onChange(eventOrValue)
    this.props.input.onChange(eventOrValue)
  }

  handleUsernameBlur = () => {
    const { username, domain } = this.state

    if (username && domain) {
      const email = username + '@' + domain

      this.props.onBlur(email)
      this.props.input.onBlur(email)
    } else {
      this.props.onBlur(null)
      this.props.input.onBlur(null)
    }
  }

  handleUsernameFocus = () => {
    const { username, domain } = this.state

    if (username && domain) {
      const email = username + '@' + domain

      this.props.onFocus(email)
      this.props.input.onFocus(email)
    } else {
      this.props.onFocus(null)
      this.props.input.onFocus(null)
    }
  }

  handleUsernameChange = eventOrValue => {
    const username = eventOrValue.target.value

    this.setState({ username }, () => {
      const { domain } = this.state

      if (username && domain) {
        const email = username + '@' + domain

        this.props.onChange(email)
        this.props.input.onChange(email)
      } else {
        this.props.onChange(null)
        this.props.input.onChange(null)
      }
    })
  }

  handleDomainChange = eventOrValue => {
    const domain = eventOrValue.target.value

    this.setState({ domain }, () => {
      const { username } = this.state

      if (username && domain) {
        const email = username + '@' + domain

        this.props.onChange(email)
        this.props.input.onChange(email)
      } else {
        this.props.onChange(null)
        this.props.input.onChange(null)
      }
    })
  }

  render() {
    const {
      className,
      input,
      isRequired,
      label,
      meta,
      options,
      resource,
      source,
      type,
      domains,
      classes,
      ...rest
    } = this.props

    if (typeof meta === 'undefined') {
      throw new Error(
        "The EmailInput component wasn't called within a redux-form <Field>. Did you decorate it and forget to add the addField prop to your component? See https://marmelab.com/react-admin/Inputs.html#writing-your-own-input-component for details."
      )
    }

    const { touched, error } = meta

    const hasError = Boolean(touched && error)

    if (!domains) {
      return (
        <MuiTextField
          margin="normal"
          type="email"
          label={
            label === false ? (
              label
            ) : (
              <FieldTitle
                label={label}
                source={source}
                resource={resource}
                isRequired={isRequired}
              />
            )
          }
          error={hasError}
          helperText={touched && error}
          className={className}
          {...options}
          {...sanitizeRestProps(rest)}
          {...input}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
          onChange={this.handleChange}
        />
      )
    }

    const { username, domain } = this.state

    return (
      <div>
        <MuiTextField
          margin="normal"
          type="text"
          label={
            label === false ? (
              label
            ) : (
              <FieldTitle
                label={label}
                source={source}
                resource={resource}
                isRequired={isRequired}
              />
            )
          }
          error={hasError}
          helperText={touched && error}
          classes={{
            root: classes.usernameInput,
          }}
          className={className}
          {...options}
          {...sanitizeRestProps(rest)}
          // {...input}
          inputProps={{
            style: {
              textAlign: 'right',
            },
          }}
          onBlur={this.handleUsernameBlur}
          onFocus={this.handleUsernameFocus}
          onChange={this.handleUsernameChange}
          value={username}
        />
        @
        <MuiTextField
          select
          margin="normal"
          type="text"
          error={hasError}
          classes={{
            root: classes.domainInput,
          }}
          className={className}
          {...options}
          {...sanitizeRestProps(rest)}
          onChange={this.handleDomainChange}
          value={domain}
        >
          {this.initialDomainValue && !domains.includes(this.initialDomainValue)
            ? domains.concat([this.initialDomainValue]).map(domain => (
                <MenuItem key={domain} value={domain}>
                  {domain}
                </MenuItem>
              ))
            : domains.map(domain => (
                <MenuItem key={domain} value={domain}>
                  {domain}
                </MenuItem>
              ))}
        </MuiTextField>
      </div>
    )
  }
}

EmailInput.propTypes = {
  className: PropTypes.string,
  input: PropTypes.object,
  isRequired: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  meta: PropTypes.object,
  name: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  options: PropTypes.object,
  resource: PropTypes.string,
  source: PropTypes.string,
  type: PropTypes.string,
  domains: PropTypes.array,
  classes: PropTypes.object,
}

EmailInput.defaultProps = {
  onBlur: () => {},
  onChange: () => {},
  onFocus: () => {},
  options: {},
  type: 'text',
}

export default addField(withStyles(styles)(EmailInput))
