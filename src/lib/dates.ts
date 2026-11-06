/**
 * Парсинг строки 'YYYY-MM-DD' как ЛОКАЛЬНОЙ даты.
 * `new Date('YYYY-MM-DD')` трактует строку как UTC-полночь, из-за чего в поясах
 * западнее Гринвича дата отображалась бы предыдущим днём.
 */
export function parseISODateLocal(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return new Date(Number.NaN)
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return new Date(Number.NaN)
  return new Date(year, month - 1, day)
}
