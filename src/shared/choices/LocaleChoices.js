import languages from '@cospired/i18n-iso-languages'
import config from 'config'

languages.registerLocale(require('@cospired/i18n-iso-languages/langs/en.json'))

export default config.Internalization.LOCALES.map(locale => ({
  id: locale,
  name: languages.getName(locale, 'en'),
}))
