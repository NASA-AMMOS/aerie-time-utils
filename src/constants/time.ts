/**
 * Regex for parsing ISO ordinal date and time format (YYYY-DDDTHH:mm:ss.SSS).
 *
 * @example
 * // Matches:
 * '2023-001T10:30:45'
 * '2024-366T23:59:59.999'
 *
 * @example
 * // Capture groups:
 * // year: '2023' or '2024'
 * // doy: '001' to '366' (depending on the year)
 * // hr: '00' to '23'
 * // mins: '00' to '59'
 * // secs: '00' to '59'
 * // ms (optional): one or more digits for milliseconds
 */
export const ISO_ORDINAL_TIME_REGEX =
  /^(?<year>(\d{4}))-(?<doy>(\d{3}))T(?<hr>(\d{2})):(?<mins>(\d{2})):(?<secs>(\d{2}))(?:\.(?<ms>\d+))?$/;

/**
 * Regex for parsing ISO 8601 UTC date and time format (YYYY-MM-DDTHH:mm:ss.SSSZ).
 * The 'Z' at the end signifies UTC.
 *
 * @example
 * // Matches:
 * '2023-10-26T14:00:00Z'
 * '2024-01-01T00:00:00.123Z'
 *
 * @example
 * // Capture groups:
 * // year: '2023' or '2024'
 * // month: '01' to '12'
 * // day: '01' to '31' (depending on the month and year)
 * // hr: '00' to '23'
 * // mins: '00' to '59'
 * // secs: '00' to '59'
 * // ms (optional): one or more digits for milliseconds
 */
export const ISO_8601_UTC_REGEX =
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hr>\d{2}):(?<mins>\d{2}):(?<secs>\d{2})(?:\.(?<ms>\d+))?Z$/;

/**
 * Regex for parsing day-of-year (DOY) and time format ([+/-]DDD[T]HH:mm:ss.SSS).
 * The sign and 'T' separator are optional.
 *
 * @example
 * // Matches:
 * '123T08:15:30'
 * '+30012:45:00.500'
 * '-050T23:00:00'
 * '00100:00:00'
 *
 * @example
 * // Capture groups:
 * // sign (optional): '+' or '-'
 * // doy (optional): '001' to '365' (can be absent if only time is provided)
 * // hr: '00' to '23'
 * // mins: '00' to '59'
 * // secs: '00' to '59'
 * // ms (optional): one or more digits for milliseconds
 */
export const DOY_TIME_REGEX =
  /^((?<sign>[+-]?))(?<doy>(\d{3}))?(T)?(?<hr>(\d{2})):(?<mins>(\d{2})):(?<secs>(\d{2}))(?:\.(?<ms>\d+))?$/;

/**
 * Regex for parsing time represented as seconds from a reference point,
 * optionally with a sign and milliseconds ([+/-]ss.SSS).
 *
 * @example
 * // Matches:
 * '123'
 * '-456.789'
 * '+99'
 * '0.5'
 *
 * @example
 * // Capture groups:
 * // sign (optional): '+' or '-'
 * // secs: one or more digits representing seconds
 * // ms (optional): one or more digits for milliseconds
 */
export const SECOND_TIME_REGEX =
  /^(?<sign>([+-]?))(?<secs>(\d+))(?:\.(?<ms>\d+))?$/;

/**
 * Maximum valid year for UTC dates.
 */
export const MAX_UTC_YEAR = 9999;
