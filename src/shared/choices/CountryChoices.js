import ISOCountries from 'i18n-iso-countries'

ISOCountries.registerLocale(require('i18n-iso-countries/langs/en.json'))

export const countries = ISOCountries.getNames('en')

export default Object.keys(countries).map(code => ({
  id: code,
  name: countries[code],
}))
