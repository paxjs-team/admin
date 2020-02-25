/**
 *
 * Get UTC offset
 *
 */

export default function getUTCOffset() {
  const offset = -Math.ceil(new Date().getTimezoneOffset() / 60) || 0

  return offset >= 0 ? `+${offset}` : String(offset)
}
