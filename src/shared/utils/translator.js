/**
 *
 * Translator
 *
 */

import translate from 'translate'
import config from 'config'

export default function translator({ value, fromLocale, toLocale }) {
  return translate(value, {
    from: fromLocale,
    to: toLocale,
    engine: 'google',
    key: config.Google.API_KEY,
  })
}
