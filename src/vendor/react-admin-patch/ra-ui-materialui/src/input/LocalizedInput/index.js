import React, { createContext } from 'react'
import PropTypes from 'prop-types'

import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { withStyles } from '@material-ui/core/styles'
import Divider from '@material-ui/core/Divider'
import TranslateIcon from '@material-ui/icons/GTranslate'
import TranslateAllIcon from '@material-ui/icons/Translate'
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep'
import TextFormatIcon from '@material-ui/icons/TextFormat'
import IconButton from '@material-ui/core/IconButton'

import { getFormValues, getFormSyncErrors, FormName, change } from 'redux-form'
import { connect } from 'react-redux'

import CountryCodeByLocale from './CountryCodeByLocale'
import LocaleByCountryCode from './LocaleByCountryCode'
import CountryIcon from './CountryIcon'
import { get, has } from 'lodash'
import { isFragment } from 'react-is'

import { setIsLoading as setIsLoadingAction } from 'react-admin-patch/ra-core/src/actions/uiActions'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 40,
  },
  tab: {
    minWidth: 100,
    borderTop: '2px solid transparent',
  },
  errorTab: {
    minWidth: 100,
    borderTop: '2px solid red',
  },
  hidden: {
    display: 'none',
  },
  textFormatIcon: {
    marginTop: 2,
    fontSize: 28,
  },
}

export const LocalizedInputContext = createContext()

const LOCAL_STORAGE_LOCALIZED_INPUT_CONTEXT_KEY =
  'persistedLocalizedInputContext'

let initialContext = {}

try {
  const persistedLocalizedInputContext = localStorage.getItem(
    LOCAL_STORAGE_LOCALIZED_INPUT_CONTEXT_KEY
  )

  if (persistedLocalizedInputContext) {
    initialContext = JSON.parse(persistedLocalizedInputContext)
  }
} catch (err) {
  console.log('Parsing persisted localized input context error: ', err)
}

export class LocalizedInputContextProvider extends React.Component {
  static propTypes = {
    children: PropTypes.any,
  }

  state = initialContext

  render() {
    return (
      <LocalizedInputContext.Provider
        value={{
          forms: this.state,
          changeFormContext: this._changeFormContext,
        }}
      >
        {this.props.children}
      </LocalizedInputContext.Provider>
    )
  }

  _changeFormContext = ({ formName, activeLocale, activeCountryCode }) =>
    this.setState(
      prevState => {
        const nextFormContext = prevState[formName] || {}

        if (activeLocale) {
          nextFormContext.activeLocale = activeLocale

          if (CountryCodeByLocale[activeLocale]) {
            nextFormContext.activeCountryCode =
              CountryCodeByLocale[activeLocale]
          }
        }

        if (activeCountryCode) {
          nextFormContext.activeCountryCode = activeCountryCode

          if (LocaleByCountryCode[activeCountryCode]) {
            nextFormContext.activeLocale =
              LocaleByCountryCode[activeCountryCode]
          }
        }

        return {
          [formName]: nextFormContext,
        }
      },
      () =>
        localStorage.setItem(
          LOCAL_STORAGE_LOCALIZED_INPUT_CONTEXT_KEY,
          JSON.stringify(this.state)
        )
    )
}

class LocalizedInputView extends React.Component {
  static propTypes = {
    input: PropTypes.object,
    source: PropTypes.string,
    form: PropTypes.object,
    onTabChange: PropTypes.func,
    children: PropTypes.any,
    translator: PropTypes.func,
    classes: PropTypes.object,
    locales: PropTypes.array.isRequired,
    countryCodes: PropTypes.array,
    fullWidth: PropTypes.bool,
    activeLocale: PropTypes.string,
    activeCountryCode: PropTypes.string,
    changeFormContext: PropTypes.func,
    changeValue: PropTypes.func,
    setIsLoading: PropTypes.func,
    values: PropTypes.object,
    syncErrors: PropTypes.object,
    formName: PropTypes.string,
  }

  static defaultProps = {
    locales: [],
    fullWidth: true,
  }

  activeTab = 0

  render() {
    const {
      classes,
      onTabChange,
      source,
      children,
      translator,
      locales,
      activeLocale,
      activeCountryCode,
      changeFormContext,
      formName,
      syncErrors,
      changeValue,
      setIsLoading,
      countryCodes,
      ...rest
    } = this.props

    const keys = countryCodes || locales

    if (countryCodes) {
      if (countryCodes.includes(activeCountryCode)) {
        this.activeTab = countryCodes.indexOf(activeCountryCode)
      }
    } else if (locales.includes(activeLocale)) {
      this.activeTab = locales.indexOf(activeLocale)
    }

    return (
      <div className={classes.container}>
        <div>
          <div>
            <Tabs
              value={this.activeTab}
              onChange={this._handleTabChange}
              indicatorColor="primary"
            >
              {keys.map((key, index) => {
                const hasError =
                  syncErrors && has(syncErrors, `${this.props.source}.${key}`)

                return (
                  <Tab
                    key={key}
                    icon={
                      <CountryIcon
                        countryCode={
                          countryCodes ? key : CountryCodeByLocale[key]
                        }
                        isActive={this.activeTab === index}
                        shape={countryCodes ? 'circle' : 'square'}
                      />
                    }
                    classes={{
                      root: hasError ? classes.errorTab : classes.tab,
                    }}
                  />
                )
              })}
            </Tabs>

            <Divider />

            {keys.map((key, index) => {
              const renderProps = countryCodes
                ? { countryCode: key }
                : { locale: key }

              let childrenToRender =
                typeof children === 'function'
                  ? children(renderProps)
                  : children

              if (isFragment(childrenToRender)) {
                childrenToRender = childrenToRender.props.children
              }

              const hasMultipleChildren =
                React.Children.count(childrenToRender) > 1

              const fields = React.Children.map(childrenToRender, child => {
                const newSource =
                  (source ? `${source}.${key}` : key) +
                  (child.props.source ? '.' + child.props.source : '')

                return React.cloneElement(child, {
                  /**
                   * Force redraw when the tab becomes active
                   *
                   * This is because the fields, decorated by redux-form and connect,
                   * aren't redrawn by default when the tab becomes active.
                   * Unfortunately, some material-ui fields (like multiline TextField)
                   * compute their size based on the scrollHeight of a dummy DOM element,
                   * and scrollHeight is 0 in a hidden div. So they must be redrawn
                   * once the tab becomes active.
                   *
                   * @ref https://github.com/marmelab/react-admin/issues/1956
                   */
                  key: `${key}_${this.activeTab !== index}`,
                  inputRef: ref => {
                    this[`tab_${index}`] = ref
                  },
                  ...rest,
                  ...child.props,
                  id: newSource,
                  source: newSource,
                })
              })

              return (
                <div
                  key={key}
                  className={this.activeTab !== index ? classes.hidden : null}
                  style={{ marginTop: hasMultipleChildren ? 15 : 0 }}
                >
                  {hasMultipleChildren ? (
                    <Card>
                      <CardContent>{fields}</CardContent>
                    </Card>
                  ) : (
                    fields
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <IconButton
          className={
            !translator || this.activeTab === 0 ? classes.hidden : null
          }
          color="primary"
          onClick={this._translate}
          title="translate"
        >
          <TranslateIcon color="secondary" />
        </IconButton>

        <IconButton
          className={
            !translator || this.activeTab !== 0 ? classes.hidden : null
          }
          color="primary"
          onClick={this._translateAll}
          title="translate all"
        >
          <TranslateAllIcon color="secondary" />
        </IconButton>

        <IconButton
          className={
            !translator || this.activeTab !== 0 ? classes.hidden : null
          }
          color="primary"
          onClick={this._setEnglishOnAll}
          title="set English on all"
        >
          <TextFormatIcon className={classes.textFormatIcon} color="primary" />
        </IconButton>

        <IconButton color="primary" onClick={this._clearAll} title="clear all">
          <DeleteSweepIcon color="error" />
        </IconButton>
      </div>
    )
  }

  _handleTabChange = (e, value) => {
    const {
      formName,
      activeLocale,
      activeCountryCode,
      changeFormContext,
      locales,
      countryCodes,
    } = this.props

    if (countryCodes) {
      const nextCountryCode = countryCodes[value]

      if (activeCountryCode !== nextCountryCode) {
        changeFormContext({ formName, activeCountryCode: nextCountryCode })

        setTimeout(() => {
          const inputElement = this[`tab_${value}`]

          if (inputElement && inputElement.type === 'text') {
            inputElement.focus()
          }
        }, 100)
      }
    } else {
      const nextLocale = locales[value]

      if (activeLocale !== nextLocale) {
        changeFormContext({ formName, activeLocale: nextLocale })

        setTimeout(() => {
          const inputElement = this[`tab_${value}`]

          if (inputElement && inputElement.type === 'text') {
            inputElement.focus()
          }
        }, 100)
      }
    }
  }

  _translate = async () => {
    const {
      translator,
      values,
      locales,
      countryCodes,
      formName,
      changeValue,
      source,
    } = this.props

    if (this.activeTab !== 0 && translator) {
      let fromLocale, toLocale, value, propSource

      if (countryCodes) {
        const activeCountryCode = countryCodes[this.activeTab]

        const firstTabCountryCode = countryCodes[0]

        fromLocale = LocaleByCountryCode[firstTabCountryCode]

        value = get(values, firstTabCountryCode)

        toLocale = LocaleByCountryCode[activeCountryCode]

        propSource = `${source}.${activeCountryCode}`
      } else {
        const activeLocale = locales[this.activeTab]

        fromLocale = locales[0]

        value = get(values, fromLocale)

        toLocale = activeLocale

        propSource = `${source}.${activeLocale}`
      }

      if (fromLocale && toLocale && value && typeof value === 'string') {
        if (fromLocale === toLocale) {
          changeValue(formName, propSource, value)
        } else {
          try {
            const translatedValue = await translator({
              value,
              fromLocale,
              toLocale,
            })

            changeValue(formName, propSource, translatedValue)
          } catch (err) {
            console.log('err', err)
          }
        }
      }
    }
  }

  _translateAll = async () => {
    const {
      translator,
      values,
      locales,
      formName,
      changeValue,
      setIsLoading,
      source,
      countryCodes,
    } = this.props

    if (this.activeTab === 0 && translator) {
      let fromLocale, value, localesList, propSourceList

      if (countryCodes) {
        const firstTabCountryCode = countryCodes[0]

        fromLocale = LocaleByCountryCode[firstTabCountryCode]
        value = get(values, firstTabCountryCode)
        localesList = countryCodes.map(
          countryCode => LocaleByCountryCode[countryCode]
        )
        propSourceList = countryCodes.map(
          countryCode => `${source}.${countryCode}`
        )
      } else {
        fromLocale = locales[0]
        value = get(values, fromLocale)
        localesList = locales
        propSourceList = locales.map(locale => `${source}.${locale}`)
      }

      if (fromLocale && value && typeof value === 'string') {
        setIsLoading(true)

        try {
          const newValues = await Promise.all(
            localesList.map(toLocale => {
              if (fromLocale === toLocale) {
                return Promise.resolve(value)
              }

              return translator({
                value,
                fromLocale,
                toLocale,
              })
            })
          )

          newValues.forEach((value, index) =>
            changeValue(formName, propSourceList[index], value)
          )
        } catch (err) {
          console.log('err', err)
        } finally {
          setIsLoading(false)
        }
      }
    }
  }

  _setEnglishOnAll = () => {
    const {
      values,
      locales,
      formName,
      changeValue,
      source,
      countryCodes,
    } = this.props

    if (this.activeTab === 0) {
      let value, localesList, propSourceList

      if (countryCodes) {
        const firstTabCountryCode = countryCodes[0]

        value = get(values, firstTabCountryCode)
        localesList = countryCodes.map(
          countryCode => LocaleByCountryCode[countryCode]
        )
        propSourceList = countryCodes.map(
          countryCode => `${source}.${countryCode}`
        )
      } else {
        value = get(values, locales[0])
        localesList = locales
        propSourceList = locales.map(locale => `${source}.${locale}`)
      }

      if (value && typeof value === 'string') {
        for (let i = 1; i < localesList.length; i++) {
          if (
            (countryCodes && !values[countryCodes[i]]) ||
            !values[localesList[i]]
          ) {
            changeValue(formName, propSourceList[i], value)
          }
        }
      }
    }
  }

  _clearAll = () => {
    const { locales, formName, changeValue, source, countryCodes } = this.props

    let localesList, propSourceList

    if (countryCodes) {
      localesList = countryCodes.map(
        countryCode => LocaleByCountryCode[countryCode]
      )
      propSourceList = countryCodes.map(
        countryCode => `${source}.${countryCode}`
      )
    } else {
      localesList = locales
      propSourceList = locales.map(locale => `${source}.${locale}`)
    }

    for (let i = 0; i < localesList.length; i++) {
      changeValue(formName, propSourceList[i], null)
    }
  }
}

function mapStateToProps(state, { formName, source }) {
  return {
    values: get(getFormValues(formName)(state), source),
    syncErrors: getFormSyncErrors(formName)(state),
  }
}

const EnhancedLocalizedInputView = connect(
  mapStateToProps,
  {
    changeValue: change,
    setIsLoading: setIsLoadingAction,
  }
)(withStyles(styles)(LocalizedInputView))

export default function LocalizedInput(props) {
  return (
    <FormName>
      {({ form }) => (
        <LocalizedInputContext.Consumer>
          {({ forms, changeFormContext } = {}) => {
            const formContext = forms[form]
            const formActiveLocale = formContext
              ? formContext.activeLocale
              : undefined
            const formActiveCountryCode = formContext
              ? formContext.activeCountryCode
              : undefined

            return (
              <EnhancedLocalizedInputView
                {...props}
                activeLocale={formActiveLocale}
                activeCountryCode={formActiveCountryCode}
                changeFormContext={changeFormContext}
                formName={form}
              />
            )
          }}
        </LocalizedInputContext.Consumer>
      )}
    </FormName>
  )
}
