/**
 * @param {Date} date value to convert
 * @returns {String} A standardized datetime (yyyy-MM-ddThh:mm), to be passed to an <input type="datetime-local" />
 */

export default function convertDateToString(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    return ''
  }

  const leftPad = (nb = 2) => v => ('0'.repeat(nb) + v).slice(-nb)
  const leftPad4 = leftPad(4)
  const leftPad2 = leftPad(2)

  const yyyy = leftPad4(date.getFullYear())
  const MM = leftPad2(date.getMonth() + 1)
  const dd = leftPad2(date.getDate())
  const hh = leftPad2(date.getHours())
  const mm = leftPad2(date.getMinutes())

  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`
}
