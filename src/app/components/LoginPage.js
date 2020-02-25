/**
 *
 * LoginPage
 *
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { propTypes, reduxForm, Field } from 'redux-form'
import { connect } from 'react-redux'

import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CircularProgress from '@material-ui/core/CircularProgress'
import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'
import LockIcon from '@material-ui/icons/Lock'
import FacebookLogin from 'react-facebook-login'

import { Notification, translate, userLogin } from 'react-admin'

import themes from '@/app/styles/themes'

import config from 'config'

const styles = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'flex-start',
    background: 'url(https://source.unsplash.com/random/800x600/)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },
  card: {
    minWidth: 300,
    marginTop: '6em',
  },
  avatar: {
    margin: '1em',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2em',
  },
  icon: {
    backgroundColor: themes[config.ENVIRONMENT],
  },
  button: {
    backgroundColor: themes[config.ENVIRONMENT],
    '&:hover': {
      backgroundColor: themes[config.ENVIRONMENT],
    },
  },
  form: {
    padding: '0 1em 1em 1em',
  },
  input: {
    marginTop: '1em',
  },
  actions: {
    padding: '0 1em 1em 1em',
    display: 'flex',
    flexDirection: 'column',
  },
  buttonsDevider: {
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.38)',
    fontSize: 15,
    height: 25,
    lineHeight: '25px',
    margin: '5px 0',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
    color: '#ffffff',
    border: 'none',
    height: 36,
    width: 268,
    borderRadius: 4,
    textTransform: 'uppercase',
    boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.24), 0 0 2px 0 rgba(0, 0, 0, 0.12)',
    cursor: 'pointer',
    display: 'block',
    outline: 'none',
    position: 'relative',
    opacity: 1,
    fontSize: '0.875rem',
    letterSpacing: 0,
    fontWeight: 500,
    margin: 0,
    userSelect: 'none',
    '&::before': {
      content: '',
      backgroundImage:
        "url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2050%2050%22%20enable-background%3D%22new%200%200%2050%2050%22%3E%3Cpath%20d%3D%22M26%2020v-3c0-1.3.3-2%202.4-2H31v-5h-4c-5%200-7%203.3-7%207v3h-4v5h4v15h6V25h4.4l.6-5h-5z%22%20fill%3D%22%23ffffff%22%20%2F%3E%3C%2Fsvg%3E')",
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      display: 'inline-block',
      width: 26,
      height: 26,
      verticalAlign: 'middle',
      position: 'absolute',
      left: 69,
      top: 5,
    },
  },
}

// see http://redux-form.com/6.4.3/examples/material-ui/
const renderInput = ({
  meta: { touched, error } = {},
  input: { ...inputProps },
  ...props
}) => (
  <TextField
    error={Boolean(touched && error)}
    helperText={touched && error}
    {...inputProps}
    {...props}
    fullWidth
  />
)

renderInput.propTypes = {
  meta: PropTypes.object,
  input: PropTypes.object,
}

export default
@translate
@reduxForm({
  form: 'signIn',
  validate: (values, props) => {
    const errors = {}
    const { translate } = props

    if (!values.username) {
      errors.username = translate('ra.validation.required')
    }

    if (!values.password) {
      errors.password = translate('ra.validation.required')
    }

    return errors
  },
})
@connect(state => ({ isLoading: state.admin.loading > 0 }), { userLogin })
@withStyles(styles)
class Login extends Component {
  static propTypes = {
    ...propTypes,
    authProvider: PropTypes.func,
    classes: PropTypes.object,
    previousRoute: PropTypes.string,
    translate: PropTypes.func.isRequired,
    userLogin: PropTypes.func.isRequired,
  }

  render() {
    const { classes, handleSubmit, isLoading, translate } = this.props

    return (
      <div className={classes.main}>
        <Card className={classes.card}>
          <div className={classes.avatar}>
            <Avatar className={classes.icon}>
              <LockIcon />
            </Avatar>
          </div>

          <form onSubmit={handleSubmit(this._loginWithEmail)}>
            <div className={classes.form}>
              <div className={classes.input}>
                <Field
                  autoFocus
                  name="username"
                  component={renderInput}
                  label={translate('ra.auth.username')}
                  disabled={isLoading}
                />
              </div>
              <div className={classes.input}>
                <Field
                  name="password"
                  component={renderInput}
                  label={translate('ra.auth.password')}
                  type="password"
                  disabled={isLoading}
                />
              </div>
            </div>

            <CardActions className={classes.actions}>
              <Button
                variant="raised"
                type="submit"
                color="primary"
                disabled={isLoading}
                className={classes.button}
                fullWidth
              >
                {translate('ra.auth.sign_in')}
              </Button>

              <div className={classes.buttonsDevider}>
                {isLoading ? (
                  <CircularProgress size={25} thickness={2} />
                ) : (
                  'OR'
                )}
              </div>

              <FacebookLogin
                appId={config.Facebook.APP_ID}
                autoLoad={false}
                scope="public_profile,email"
                fields="name,email"
                callback={this._loginWithFacebook}
                cssClass={classes.facebookButton}
                textButton="Facebook"
              />
            </CardActions>
          </form>
        </Card>
        <Notification />
      </div>
    )
  }

  _loginWithEmail = auth =>
    this.props.userLogin(
      Object.assign(auth, { providerId: 'password' }),
      this.props.location.state ? this.props.location.state.nextPathname : '/'
    )

  _loginWithFacebook = response => {
    if (
      !response.error &&
      response.status !== 'unknown' &&
      response.status !== 'not_authorized'
    ) {
      const auth = {
        providerId: 'facebook.com',
        token: response.accessToken,
        username: response.email,
      }

      this.props.userLogin(
        auth,
        this.props.location.state ? this.props.location.state.nextPathname : '/'
      )
    }
  }
}
