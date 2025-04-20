import { padStart } from 'lodash-es';
import parseInterval from 'postgres-interval';

import { ISO_ORDINAL_TIME_REGEX,SECOND_TIME_REGEX, DOY_TIME_REGEX, ISO_8601_UTC_REGEX, MAX_UTC_YEAR } from './constants/time.js';
import { TimeTypes } from './enums/time.js';
import type { DurationTimeComponents, ParsedDoyString, ParsedDurationString, ParsedYmdString } from './types/time.js';

/**
 * Validates a time string based on the specified type.
 * @param {string} time - The time string to validate.
 * @param {TimeTypes} type - The type of time to validate against.
 * @returns {boolean} - True if the time string is valid, false otherwise.
 * @example
 * validateTime('2022-012T12:34:56.789', TimeTypes.ISO_ORDINAL_TIME); // true
 * validateTime('P1DT2H30M', TimeTypes.DOY_TIME); // returns true
 * validateTime('P1DT2H30M', TimeTypes.ISO_ORDINAL_TIME); // returns false
 * validateTime('invalid-string', TimeTypes.ISO_ORDINAL_TIME); // returns false
 */
export function validateTime(time: string, type: TimeTypes): boolean {
  switch (type) {
    case TimeTypes.ISO_ORDINAL_TIME:
      return ISO_ORDINAL_TIME_REGEX.exec(time) !== null;
    case TimeTypes.ISO_8601_UTC_TIME:
      return ISO_8601_UTC_REGEX.exec(time) !== null;
    case TimeTypes.DOY_TIME:
      return DOY_TIME_REGEX.exec(time) !== null;
    case TimeTypes.SECOND_TIME:
      return SECOND_TIME_REGEX.exec(time) !== null;
    default:
      return false;
  }
}

/**
 * Determines if the given time string represents a maximum time value based on the specified time type.
 * 
 * @param {string} time - The time string to check.
 * @param {TimeTypes} type - The time type to check against.
 * @returns {boolean} - True if the time string is a max time, false otherwise.
 * @example
 * isTimeMax('2099-365T23:59:59.999', TimeTypes.ISO_ORDINAL_TIME); // false
 * isTimeMax('-365T23:59:60.999', TimeTypes.DOY_TIME)) // true

 */
export function isTimeMax(time: string, type: TimeTypes): boolean {
  switch (type) {
    case TimeTypes.ISO_ORDINAL_TIME:
    case TimeTypes.ISO_8601_UTC_TIME: {
      const year = (parseDoyOrIsoTime(isoFromJSDate(new Date(getUnixEpochTime(time)))) as ParsedDoyString)?.year;
      return year ? year > MAX_UTC_YEAR : true;
    }
    case TimeTypes.DOY_TIME: {
      const duration = parseDurationString(time);
      const originalYear = parseInt(convertDurationToDoy(duration).slice(0, 4));
      const year = (
        parseDoyOrIsoTime(isoFromJSDate(new Date(getUnixEpochTime(convertDurationToDoy(duration))))) as ParsedDoyString
      )?.year;
      return originalYear !== year;
    }
    default:
      return false;
  }
}

/**
 * Determines if the given time string is balanced based on the specified time type.
 * @param {string} time - The time string to check.
 * @param {TimeTypes} type - The time type to check against.
 * @returns {boolean} - True if the time string is balanced, false otherwise.
 * @example
 * isTimeBalanced('2022-01-01T00:00:00.000', TimeTypes.ISO_ORDINAL_TIME); // true
 * isTimeBalanced('50000d', TimeTypes.DOY_TIME); // false
 */
export function isTimeBalanced(time: string, type: TimeTypes): boolean {
  switch (type) {
    case TimeTypes.ISO_ORDINAL_TIME: {
      const balancedTime = parseDoyOrIsoTime(isoFromJSDate(new Date(getUnixEpochTime(time)))) as ParsedDoyString;
      const originalTime = parseDoyOrIsoTime(time) as ParsedDoyString;
      if (balancedTime === null || originalTime === null) {
        return false;
      }
      return originalTime.year === balancedTime.year && 
        originalTime.doy === balancedTime.doy &&
        originalTime.hour === balancedTime.hour &&
        originalTime.min === balancedTime.min &&
        originalTime.sec === balancedTime.sec;
    }
    case TimeTypes.DOY_TIME: {
      const originalTime = parseDurationString(time);
      const balancedTime = parseDurationString(getBalancedDuration(time));

      if (balancedTime === null || originalTime === null) {
        return false;
      }
      return (
        balancedTime.days === originalTime.days &&
        balancedTime.hours === originalTime.hours &&
        balancedTime.minutes === originalTime.minutes &&
        balancedTime.seconds === originalTime.seconds &&
        balancedTime.milliseconds === originalTime.milliseconds
      );
    }
    default:
      return false;
  }
}

/**
 * Parse a DOY, seconds, or human-readable duration string into a parsed duration object.
 * If no unit is specified, it defaults to microseconds.
 *
 * @param {string} durationString - The duration string to parse that is of format DOY, seconds, or human-readable duration.
 * @param {'years' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds' | 'microseconds'} units - The units to parse the duration string in.
 * @return {ParsedDurationString} The parsed duration object.
 * @throws {Error} If the duration string is invalid.
 * 
 * @example
 * parseDurationString('1h 30m');
 * // => {
 * // =>   days: 0,
 * // =>   hours: 1,
 * // =>   isNegative: false,
 * // =>   microseconds: 0,
 * // =>   milliseconds: 0,
 * // =>   minutes: 30,
 * // =>   seconds: 0,
 * // =>   years: 0,
 * // => }
 * @example
 * parseDurationString('-002T00:45:00.010')
 * // => {
 * // =>   days: 2,
 * // =>   hours: 0,
 * // =>   isNegative: true,
 * // =>   microseconds: 0,
 * // =>   milliseconds: 10,
 * // =>   minutes: 45,
 * // =>   seconds: 0,
 * // =>   years: 0,
 * // => }
 * @example
 * parseDurationString('90')
 * // => {
 * // =>   minutes: 0,
 * // =>   seconds: 0,
 * // =>   microseconds: 90,
 * // =>   milliseconds: 0,
 * // =>   days: 0,
 * // =>   hours: 0,
 * // =>   isNegative: false,
 * // =>   years: 0,
 * // => }
 * @example
 * parseDurationString('-123.456s', 'microseconds')
 * // => {
 * // =>   microseconds: 0,
 * // =>   milliseconds: 456,
 * // =>   seconds: -123,
 * // =>   minutes: 0,
 * // =>   hours: 0,
 * // =>   days: 0,
 * // =>   isNegative: true,
 * // =>   years: 0,
 * // => }
 *
 */
export function parseDurationString(
  durationString: string,
  units: 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds' | 'microseconds' = 'microseconds',
): ParsedDurationString | never {
  const validNegationRegex = `((?<isNegative>-))?`;
  const validDurationValueRegex = `([+-]?)(\\d+)(\\.\\d+)?`;
  const validYearsDurationRegex = `(?:\\s*(?<years>${validDurationValueRegex})y)`;
  const validDaysDurationRegex = `(?:\\s*(?<days>${validDurationValueRegex})d)`;
  const validHoursDurationRegex = `(?:\\s*(?<hours>${validDurationValueRegex})h)`;
  const validMinutesDurationRegex = `(?:\\s*(?<minutes>${validDurationValueRegex})m(?!s))`;
  const validSecondsDurationRegex = `(?:\\s*(?<seconds>${validDurationValueRegex})s)`;
  const validMillisecondsDurationRegex = `(?:\\s*(?<milliseconds>${validDurationValueRegex})ms)`;
  const validMicrosecondsDurationRegex = `(?:\\s*(?<microseconds>${validDurationValueRegex})us)`;

  const fullValidDurationRegex = new RegExp(
    `^${validNegationRegex}${validYearsDurationRegex}?${validDaysDurationRegex}?${validHoursDurationRegex}?${validMinutesDurationRegex}?${validSecondsDurationRegex}?${validMillisecondsDurationRegex}?${validMicrosecondsDurationRegex}?$`,
  );

  let matches = durationString.match(fullValidDurationRegex);

  if (matches !== null) {
    const {
      groups: {
        isNegative = '',
        years = '0',
        days = '0',
        hours = '0',
        minutes = '0',
        seconds = '0',
        milliseconds = '0',
        microseconds = '0',
      } = {},
    } = matches;

    return {
      days: parseFloat(days),
      hours: parseFloat(hours),
      isNegative: !!isNegative,
      microseconds: parseFloat(microseconds),
      milliseconds: parseFloat(milliseconds),
      minutes: parseFloat(minutes),
      seconds: parseFloat(seconds),
      years: parseFloat(years),
    };
  }

  const durationTime = parseDoyOrIsoTime(durationString) as ParsedDurationString;
  if (durationTime) {
    return durationTime;
  }

  matches = SECOND_TIME_REGEX.exec(durationString);
  if (matches !== null) {
    const { groups: { sign = '', secs = '0', ms = '0' } = {} } = matches;
    let microsecond = 0;
    let millisecond = 0;
    let second = 0;
    let minute = 0;
    let hour = 0;
    let day = 0;
    let year = 0;

    const number = parseInt(secs);
    const decimalNum = ms ? parseFloat(`.${ms}`) : 0;

    //shift everything based on units
    switch (units) {
      case 'microseconds':
        microsecond = number;
        break;
      case 'milliseconds':
        microsecond = decimalNum;
        millisecond = number;
        break;
      case 'seconds':
        millisecond = decimalNum;
        second = number;
        break;
      case 'minutes':
        second = decimalNum;
        minute = number;
        break;
      case 'hours':
        minute = decimalNum;
        hour = number;
        break;
      case 'days':
        hour = decimalNum;
        day = number;
        break;
    }

    // Normalize microseconds
    millisecond += Math.floor(microsecond / 1000000);
    microsecond = microsecond % 1000000;

    // Normalize milliseconds and seconds
    second += Math.floor(millisecond / 1000);
    millisecond = millisecond % 1000;

    // Normalize seconds and minutes
    minute += Math.floor(second / 60);
    second = second % 60;

    // Normalize minutes and hours
    hour += Math.floor(minute / 60);
    minute = minute % 60;

    // Normalize hours and days
    day += Math.floor(hour / 24);
    hour = hour % 24;

    // Normlize days and years
    year += Math.floor(day / 365);
    day = day % 365;

    return {
      days: day,
      hours: hour,
      isNegative: sign !== '' && sign !== '+',
      microseconds: microsecond,
      milliseconds: millisecond,
      minutes: minute,
      seconds: second,
      years: year,
    };
  }

  throw new Error(`Invalid time format: Must be of format:
    1y 3d 2h 24m 35s 18ms 70us,
    [+/-]DOYThh:mm:ss[.sss],
    duration
    `);
}

/**
 * Format a duration object to a ISO Ordinal string.
 *
 * @example
 * convertDurationToDoy({
 *   years: 0,
 *   days: 1,
 *   hours: 0,
 *   minutes: 45,
 *   seconds: 0,
 *   milliseconds: 10,
 *   microseconds: 0,
 * })
 *
 * result: '1970-1T00:45:00.010'
 *
 * @param {ParsedDurationString} duration - The duration object to format.
 * @returns {string} - The formatted day of year string.
 */
function convertDurationToDoy(duration: ParsedDurationString): string {
  const years = duration.years === 0 ? '1970' : String(duration.years).padStart(4, '0');
  const day = Math.max(1, Math.floor(duration.days));
  const hours = String(duration.hours).padStart(2, '0');
  const minutes = String(duration.minutes).padStart(2, '0');
  const seconds = String(duration.seconds).padStart(2, '0');
  const milliseconds = String(duration.milliseconds).padStart(3,'0');

  return `${years}-${day.toString().padStart(3, '0')}T${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/**
 * Gets the balanced duration in DOY based on the given duration string.
 *
 * @param {string} duration - The duration time string to calculate the balanced duration from.
 * @returns {string} The DOY balanced duration string.
 * 
 * @example
 * getBalancedDuration('-002T00:60:00.010') // => '-002T01:00:00.010'
 * getBalancedDuration('+190')) //=> '00:03:10.000'
 *
 */
export function getBalancedDuration(duration: string): string {
  const parsedDuration = parseDurationString(duration, 'seconds');
  const balancedTime = isoFromJSDate(new Date(getUnixEpochTime(convertDurationToDoy(parsedDuration))));
  const parsedBalancedTime = parseDoyOrIsoTime(balancedTime) as ParsedDoyString;
  const shouldIncludeDay = parsedDuration.days > 0 || parsedBalancedTime.doy > 1;

  const sign = parsedDuration.isNegative ? '-' : '';
  const day = shouldIncludeDay
    ? `${String(parsedBalancedTime.doy - (parsedDuration.days > 0 ? 0 : 1)).padStart(3, '0')}T`
    : '';
  const hour = String(parsedBalancedTime.hour).padStart(2, '0');
  const minutes = String(parsedBalancedTime.min).padStart(2, '0');
  const seconds = String(parsedBalancedTime.sec).padStart(2, '0');
  const milliseconds = String(parsedBalancedTime.ms).padStart(3, '0');
  return `${sign}${day}${hour}:${minutes}:${seconds}.${milliseconds}`;
}

function addUnit(value: number, unit: string, isNegative: boolean) {
  return `${isNegative ? '-' : ''}${value} ${value !== 1 ? `${unit}s` : unit}`;
}

/**
 * Converts an ISO Ordinal string 'YYYY-DDDTHH:mm:ss' or DOY string 'DOYTHH:mm:ss' into a
 * ISO 8601 (ISO UTC) time with 'Z' suffix ex. 'YYY-MM-DDTHH:mm:ssz'
 * 
 * If the input time is already in ISO UTC 'YYYY-MM-DDTHH:mm:ss' format, it will be returned as-is with a 'Z' suffix.
 *
 * @param {string} IsoOrDoyString - The ISO Ordinal string to convert, e.g., "2023-154T12:34:56".
 * @param {boolean} [includeMsecs=true] - Whether to include milliseconds in the output.
 * @returns {string | null} - A formatted date string in 'YYYY-MM-DDTHH:mm:ss[.mmm...]Z' format, or null if parsing fails.
 *
 * @example
 * convertDoyOrIsoToUtc('2023-154T12:34:56') // returns '2023-05-30T12:34:56Z'
 * convertDoyOrIsoToUtc('154T12:34:56.789', false) // returns '2023-05-30T12:34:56Z'
 * convertDoyOrIsoToUtc('2023-05-30T12:34:56') // returns '2023-05-30T12:34:56Z'
 */
export function convertDoyOrIsoToUtc(isoOrDoyString: string, includeMsecs = true): string | null {
  
  // A UTC time so just return it no conversion needed. Add 'Z' if needed
  const matches = ISO_8601_UTC_REGEX.exec(isoOrDoyString) || ISO_8601_UTC_REGEX.exec(`${isoOrDoyString}Z`)
  if(matches){
    return isoOrDoyString.indexOf('Z') !== -1 ? isoOrDoyString : `${isoOrDoyString}Z`
  }

  const parsedDoy: ParsedDoyString = parseDoyOrIsoTime(isoOrDoyString) as ParsedDoyString;

  if (parsedDoy !== null) {
    if (parsedDoy.doy !== undefined) {
      const date = new Date(parsedDoy.year, 0, parsedDoy.doy,parsedDoy.hour,parsedDoy.min,parsedDoy.sec,parsedDoy.ms);
      const ymdString = `${[
        date.getFullYear(),
        padStart(`${date.getUTCMonth() + 1}`, 2, '0'),
        padStart(`${date.getUTCDate()}`, 2, '0'),
      ].join('-')}T${parsedDoy.time}`;
      if (includeMsecs) {
        return `${ymdString}Z`;
      }
      return `${ymdString.replace(/(\.\d+)/, '')}Z`;
    }
  }

  return null;
}

/**
 * Converts a DOY, microseconds, human-readable duration string into a PostgreSQL INTERVAL formatted string.
 * 
 * The function accepts duration strings in various formats (e.g., "2y", "318d", "6h", "16m")
 * and returns a properly formatted Postgres interval. The input string must contain at least one unit of time.
 *
 * @param {string} duration - A string representing a duration in units like years, days, hours, etc.
 * @returns {string} - Returns the duration string formatted as a PostgreSQL INTERVAL.
 * 
 * @example
 * durationStringToPostgresInterval('8d 6h 16m') // returns '8 days 6 hours 16 minutes'
 * durationStringToPostgresInterval('30') // returns '30 microseconds'
 * durationStringToPostgresInterval('001T00:01:00') // returns '1 day 1 minute'
 */
export function durationStringToPostgresInterval(duration: string): string | never {
  const parsedDuration = parseDurationString(usToDurationString(durationStringToUs(duration)));

  const { isNegative, years, days, hours, minutes, seconds, milliseconds, microseconds } = parsedDuration;

  const yearsString = years ? addUnit(years, 'year', isNegative) : '';
  const daysString = days ? addUnit(days, 'day', isNegative) : '';
  const hoursString = hours ? addUnit(hours, 'hour', isNegative) : '';
  const minutesString = minutes ? addUnit(minutes, 'minute', isNegative) : '';
  const secondsString = seconds ? addUnit(seconds, 'second', isNegative) : '';
  const millisecondsString = milliseconds ? addUnit(milliseconds, 'millisecond', isNegative) : '';
  const microsecondsString = microseconds ? addUnit(microseconds, 'microsecond', isNegative) : '';

  const intervalString = [
    yearsString,
    daysString,
    hoursString,
    minutesString,
    secondsString,
    millisecondsString,
    microsecondsString,
  ]
    .filter(Boolean)
    .join(' ');

  return intervalString ? intervalString : '0';
}

/**
 * Converts an ISO 8601 (UTC) string to the number of milliseconds since the epoch (January 1, 1970 UTC).
 * This is useful for rendering purposes where you need to convert a date string into a timestamp.
 *
 * @param {string} utc - A valid ISO UTC date string in 'YYYY-MM-DDTHH:mm:ss' format.
 * @returns {number} - The number of milliseconds since the Unix epoch (1970-01-01T00:00:00Z).
 *
 * @example
 * utcToMs('2023-10-05T14:30:00') // returns 1633446600000
 *
 */
export function utcToMs(utc: string): number {
  const d = new Date(utc);
  return d.getTime();
}

/**
 * Converts a DOY, seconds, or human-readable duration string into a number representing microseconds.
 * 
 * The input string should be in the format 'DOYTHH:mm:ss.sss', 's', '2y 318d 6h 16m 19s 200ms 0us'
 *
 * This function parses each component of the duration string, converts it into microseconds,
 * sums them up, and returns the total. If the input string represents a negative duration,
 * the returned value will be negative.
 *
 * @param {string} duration - The duration string to convert.
 * @returns {number} - The number of microseconds represented by the input string.
 *
 * @example
 * durationStringToUs('045T10:05:02.001')) // returns 3924302001000;
 * durationStringToUs('30') // returns 30
 * durationStringToUs('2y 318d 6h 16m 19s 200ms 0us') // returns 90577779200000
 *
 * @note This function is the inverse of `usToDurationString`.
 *
 */
export function durationStringToUs(duration: string): number | never {
  const usPerYear = 3.154e13;
  const usPerDay = 8.64e10;
  const usPerHour = 3.6e9;
  const usPerMinute = 6e7;
  const usPerSecond = 1000000;
  const usPerMillisecond = 1000;

  const parsedDuration = parseDurationString(duration);

  let durationUs = 0;

  const { isNegative, years, days, hours, minutes, seconds, milliseconds, microseconds } = parsedDuration;

  durationUs += years * usPerYear;
  durationUs += days * usPerDay;
  durationUs += hours * usPerHour;
  durationUs += minutes * usPerMinute;
  durationUs += seconds * usPerSecond;
  durationUs += milliseconds * usPerMillisecond;
  durationUs += microseconds;

  return durationUs * (isNegative ? -1 : 1);
}

/**
 * Converts a duration in microseconds into a human-readable string format.
 *
 * If `includeZeros` is set to true, zero values will be included in the output string.
 *
 * @param {number} durationUs - The duration in microseconds.
 * @param {boolean} [includeZeros=false] - Whether to include zero-valued components in the output.
 * @returns {string} - A human-readable duration string.
 *
 * @example
 * usToDurationString(90577779200000) // returns '2y 318d 6h 16m 19s 200ms'

 * @note inverse of durationStringToUs
 */
export function usToDurationString(durationUs: number, includeZeros: boolean = false): string {
  const usPerYear = 3.154e13;
  const usPerDay = 8.64e10;
  const usPerHour = 3.6e9;
  const usPerMinute = 6e7;
  const usPerSecond = 1000000;
  const usPerMillisecond = 1000;

  const hoursPerDay = 24;
  const minutesPerHour = 60;
  const secondsPerMinute = 60;

  const isNegative = durationUs < 0;
  let absoluteDuration = Math.abs(durationUs);

  const years = Math.floor(absoluteDuration / usPerYear);
  absoluteDuration -= years * usPerYear;

  const days = Math.floor(absoluteDuration / usPerDay);
  absoluteDuration -= days * usPerDay;

  const hours = Math.floor(absoluteDuration / usPerHour) % hoursPerDay;
  absoluteDuration -= hours * usPerHour;

  const minutes = Math.floor(absoluteDuration / usPerMinute) % minutesPerHour;
  absoluteDuration -= minutes * usPerMinute;

  const seconds = Math.floor(absoluteDuration / usPerSecond) % secondsPerMinute;
  absoluteDuration -= seconds * usPerSecond;

  const milliseconds = Math.floor(absoluteDuration / usPerMillisecond);
  absoluteDuration -= milliseconds * usPerMillisecond;

  const microseconds = absoluteDuration;

  if (includeZeros) {
    return `${
      isNegative ? '- ' : ''
    }${years}y ${days}d ${hours}h ${minutes}m ${seconds}s ${milliseconds}ms ${microseconds}us`;
  }

  const negativeString = isNegative ? '-' : '';
  const yearsString = years ? `${years}y` : '';
  const daysString = days ? `${days}d` : '';
  const hoursString = hours ? `${hours}h` : '';
  const minutesString = minutes ? `${minutes}m` : '';
  const secondsString = seconds ? `${seconds}s` : '';
  const millisecondsString = milliseconds ? `${milliseconds}ms` : '';
  const microsecondsString = microseconds ? `${microseconds}us` : '';

  return [
    negativeString,
    yearsString,
    daysString,
    hoursString,
    minutesString,
    secondsString,
    millisecondsString,
    microsecondsString,
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Gets the number of days in a given month for a specific year.
 * 
 * The function calculates the last day of the specified month by creating a Date object set to the first day of the next month and retrieving the day of the month, which effectively gives the last day of the current month.
 *
 * @param {number} year - The year for which to determine the number of days in the month.
 * @param {number} month - The month (0-11) for which to determine the number of days. January is 0 and December is 11.
 * @returns {number} - The number of days in the specified month of the given year.
 *
 * @example
 * getDaysInMonth(2020, 5); // returns 30 (June has 30 days)
 * getDaysInMonth(2020, 1); // returns 29 (February in a leap year)
 */
export function getDaysInMonth(year: number, month: number): number {
  const lastOfMonth = new Date(Date.UTC(year, month + 1, 0));

  return lastOfMonth.getUTCDate();
}

/**
 * Calculates the total number of days in a given year, accounting for leap years.
 *
 * This function loops through each month of the specified year, sums up the days,
 * and returns the total. It uses `getDaysInMonth` which handles February's days correctly,
 * including leap years.
 *
 * @param {number} year - The year to calculate days for.
 * @returns {number} Total number of days in the year.
 *
 * @example
 * getDaysInYear(2023); // 365
 * getDaysInYear(2024); // 366 (leap year)
 */
export function getDaysInYear(year: number): number {
  let daysInYear = 0;
  for (let month: number = 0; month < 12; month++) {
    daysInYear += getDaysInMonth(year, month);
  }

  return daysInYear;
}

/**
 * Get the day-of-year for a given date.
 *
 * @param {Date} date - The date for which to calculate the day-of-year.
 * @returns {number} The day-of-year (1-based).
 *
 * @example
 * getDoy(new Date('1/3/2019')) // returns 3
 *
 * @see {@link https://stackoverflow.com/a/8619946}
 */
export function getDoy(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start;
  const oneDay = 8.64e7; // Number of milliseconds in a day.
  return Math.floor(diff / oneDay);
}

/**
 * Get the DOY (Day of Year) time components for a given JavaScript Date object.
 *
 * @function getDoyTimeComponents
 * @param {Date} date - The JavaScript Date object from which to extract DOY components.
 * @returns {Object} An object containing the DOY time components.
 * @returns {string} returns.doy - The day of year, zero-padded to 3 digits.
 * @returns {string} returns.hours - The hours (UTC), zero-padded to 2 digits.
 * @returns {string} returns.mins - The minutes (UTC), zero-padded to 2 digits.
 * @returns {string} returns.secs - The seconds (UTC), zero-padded to 2 digits.
 * @returns {string} returns.msecs - The milliseconds (UTC), zero-padded to 3 digits.
 * @returns {string} returns.year - The full year (UTC).
 *
 * @example
 * const date = new Date('2023-12-25T12:30:45.123Z');
 * const components = getDoyTimeComponents(date);
 * console.log(components);
 * // Output:
 * // {
 * //   doy: '359',
 * //   hours: '12',
 * //   mins: '30',
 * //   secs: '45',
 * //   msecs: '123',
 * //   year: '2023'
 * // }
 */
export function getDoyTimeComponents(date: Date) {
  return {
    doy: getDoy(date).toString().padStart(3, '0'),
    hours: date.getUTCHours().toString().padStart(2, '0'),
    mins: date.getUTCMinutes().toString().padStart(2, '0'),
    msecs: date.getUTCMilliseconds().toString().padStart(3, '0'),
    secs: date.getUTCSeconds().toString().padStart(2, '0'),
    year: date.getUTCFullYear().toString(),
  };
}

/**
 * Get the time components for a given duration object, formatted as strings.
 *
 * @param {ParsedDurationString} duration - The duration object containing time components.
 * @returns {DurationTimeComponents} An object containing the formatted time components as strings.
 *
 * @example
 * const duration = { years: 2, days: 3, hours: 10, minutes: 30, seconds: 45, milliseconds: 0, microseconds: 0, isNegative: false };
 * const components = getDurationTimeComponents(duration);
 * console.log(components);
 * // Output:
 * // {
 * //   days: '003',
 * //   hours: '10',
 * //   isNegative: '',
 * //   microseconds: '',
 * //   milliseconds: '000',
 * //   minutes: '30',
 * //   seconds: '45',
 * //   years: '0002'
 * // }
 *
 */
export function getDurationTimeComponents(duration: ParsedDurationString): DurationTimeComponents {
  return {
    days: duration.days !== 0 ? String(duration.days).padStart(3, '0') : '',
    hours: duration.hours.toString().padStart(2, '0'),
    isNegative: duration.isNegative ? '-' : '',
    microseconds: duration.microseconds !== 0 ? String(duration.microseconds).padStart(3, '0') : '',
    milliseconds: duration.milliseconds !== 0 ? String(duration.milliseconds).padStart(3, '0') : '',
    minutes: duration.minutes.toString().padStart(2, '0'),
    seconds: duration.seconds.toString().padStart(2, '0'),
    years: duration.years.toString().padStart(4, '0'),
  };
}

/**
 * Get a ISO Ordinal String from a given JavaScript Date object.
 *
 * @param {Date} date - The JavaScript Date object.
 * @param {boolean} [includeMsecs=true] - Optional. If true, include milliseconds in the timestamp if they are non-zero.
 * @returns {string} The ISO Ordinal timestamp in the format "YYYY-DOYTHH:MM:SS[.mmm]".
 *
 * @example
 * isoFromJSDate(new Date(1577779200000)) // returns "2019-365T08:00:00"
 * isoFromJSDate(new Date(1577779200123)) // returns "2019-365T08:00:00.123"
 * isoFromJSDate(new Date(1577779200123), false) // returns "2019-365T08:00:00"
 *
 * @note Inverse of getUnixEpochTime.
 * @note Milliseconds will be dropped if they are all zeros or if includeMsecs is false.
 */
export function isoFromJSDate(date: Date, includeMsecs = true): string {
  const { doy, hours, mins, msecs, secs, year } = getDoyTimeComponents(date);
  let doyTimestamp = `${year}-${doy}T${hours}:${mins}:${secs}`;

  if (includeMsecs && date.getMilliseconds() > 0) {
    doyTimestamp += `.${msecs}`;
  }

  return doyTimestamp;
}

/**
 * Get a ISO Ordinal timestamp from a given ISO 8601 start time string and a Postgres Interval duration.
 *
 * @param {string} utcStartTime - An ISO 8601 formatted start time string.
 * @param {string} postgresInterval - A Postgres Interval duration string.
 * @param {boolean} [includeMsecs=true] - Optional. If true, include milliseconds in the timestamp if they are non-zero.
 * @returns {string} The ISO Ordinal timestamp in the format "YYYY-DOYTHH:MM:SS[.mmm]".
 *
 * @example
 * const startTime = '2023-01-01T12:00:00Z';
 * const interval = '1 day 2 hours 30 minutes 15 seconds 500 milliseconds';
 * const doyTimestamp = isoFromUTCAndPostgresInterval(startTime, interval);
 * console.log(doyTimestamp); // Output: "2023-002T14:30:15.500"
*/
export function isoFromUTCAndPostgresInterval(utcStartTime: string, postgresInterval: string, includeMsecs = true): string {
  const startDate = new Date(utcStartTime);
  const parsedInterval = parseInterval(postgresInterval);
  const { days, hours, milliseconds, minutes, seconds } = parsedInterval;
  const endDate = new Date(startDate.getTime());
  endDate.setUTCDate(endDate.getUTCDate() + days);
  endDate.setUTCHours(endDate.getUTCHours() + hours);
  endDate.setUTCMinutes(endDate.getUTCMinutes() + minutes);
  endDate.setUTCSeconds(endDate.getUTCSeconds() + seconds);
  endDate.setUTCMilliseconds(endDate.getUTCMilliseconds() + milliseconds);
  return isoFromJSDate(endDate, includeMsecs);
}

/**
 * Returns a Postgres Interval duration in milliseconds.
 * If the duration is null, undefined, or an empty string, it returns 0.
 *
 * @param {string|null|undefined} postgresInterval - The Postgres Interval duration string.
 * @returns {number} The duration in milliseconds.
 *
 * @example
 * const interval = '1 day 2 hours 30 minutes 15 seconds 500 milliseconds';
 * const milliseconds = getPostgresIntervalInMs(interval);
 * console.log(milliseconds); // Output: 94815500
 *
 * @example
 * const nullInterval = null;
 * const nullResult = getPostgresIntervalInMs(nullInterval);
 * console.log(nullResult); //Output: 0
 *
 * @note This function assumes 24-hour days.
 * @note Requires a `parseInterval` function to be available in scope.
 *
 */
export function getPostgresIntervalInMs(postgresInterval: string | null | undefined): number {
  if (postgresInterval !== null && postgresInterval !== undefined && postgresInterval !== '') {
    const parsedInterval = parseInterval(postgresInterval);
    const { days, hours, milliseconds, minutes, seconds } = parsedInterval;
    const daysInMs = days * 24 * 60 * 60 * 1000;
    const hoursInMs = hours * 60 * 60 * 1000;
    const minutesInMs = minutes * 60 * 1000;
    const secondsInMs = seconds * 1000;
    return daysInMs + hoursInMs + minutesInMs + secondsInMs + milliseconds;
  }
  return 0;
}

/**
 * Returns a Postgres Interval duration string representing the difference between two ISO Ordinal timestamp strings.
 *
 * @param {string} startTime - The starting ISO Ordinal timestamp string (e.g., "YYYY-DOYTHH:MM:SS[.mmm]").
 * @param {string} endTime - The ending ISO Ordinal timestamp string (e.g., "YYYY-DOYTHH:MM:SS[.mmm]").
 * @returns {string} A Postgres Interval duration string.
 *
 * @example
 * const startTime = '2023-001T00:00:00';
 * const endTime = '2023-002T12:30:45.123';
 * const interval = getPostgresIntervalFromIsoRange(startTime, endTime);
 * console.log(interval); // Output: (e.g., "1 day 12 hours 30 minutes 45 seconds 123 milliseconds")
 *
 */
export function getPostgresIntervalFromIsoRange(startTime: string, endTime: string): string {
  const startTimeMs = getUnixEpochTime(startTime);
  const endTimeMs = getUnixEpochTime(endTime);
  return getPostgresIntervalUnixEpochTime(startTimeMs, endTimeMs);
}

/**
 * Returns a Postgres Interval duration string representing the difference between two Unix epoch UTC times in milliseconds.
 *
 * @param {number} startTimeMs - The starting Unix epoch UTC time in milliseconds.
 * @param {number} endTimeMs - The ending Unix epoch UTC time in milliseconds.
 * @returns {string} A Postgres Interval duration string in the format "HH:MM:SS.mmm" (or "-HH:MM:SS.mmm" for negative intervals).
 *
 * @example
 * const startTime = 1672531200000; // 2023-01-01T00:00:00.000Z
 * const endTime = 1672617045123;   // 2023-01-02T00:30:45.123Z
 * const interval = getIntervalUnixEpochTime(startTime, endTime);
 * console.log(interval); // Output: "24:30:45.123"
 *
 * @example
 * const startTime2 = 1672617045123;
 * const endTime2 = 1672531200000;
 * const interval2 = getPostgresIntervalUnixEpochTime(startTime2, endTime2);
 * console.log(interval2); // Output: "-24:30:45.123"
 *
 * @note This function returns a simplified interval format, without "days" or "years" components.
 */
export function getPostgresIntervalUnixEpochTime(startTimeMs: number, endTimeMs: number): string {
  const differenceMs = endTimeMs - startTimeMs;

  const isNegative = differenceMs < 0;
  const absoluteDifferenceMs = Math.abs(differenceMs);

  const seconds = Math.floor(absoluteDifferenceMs / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const remainingMilliseconds = absoluteDifferenceMs % 1000;

  const paddedHours = hours.toString().padStart(2, '0');
  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = remainingSeconds.toString().padStart(2, '0');
  const paddedMilliseconds = remainingMilliseconds.toString().padStart(3, '0');

  const sign = isNegative ? '-' : '';
  return `${sign}${paddedHours}:${paddedMinutes}:${paddedSeconds}.${paddedMilliseconds}`;
}

/**
 * Get a Unix epoch time in milliseconds given a ISO Ordinal and ISO 8601 UTC timestamp string.
 *
 * @function getUnixEpochTime
 * @param {string} isoOrUtcTime - The ISO Ordinal and ISO 8601 UTC timestamp string in the format "YYYY-DOYTHH:MM:SS[.mmm]" or "YYYY-MM-DDTHH:mm:ssZ".
 * @returns {number} The Unix epoch time in milliseconds. Returns 0 if the timestamp is invalid.
 *
 * @example
 * getUnixEpochTime('2019-365T08:00:00.000') // returns 1577779200000
 * getUnixEpochTime('2023-12-27T10:30:00Z') // returns 1577779200000
 * 
 * @note Inverse of getDoyTime.
 */
export function getUnixEpochTime(isoOrUtcTime: string): number {
  let match = ISO_ORDINAL_TIME_REGEX.exec(isoOrUtcTime);
  if (match && match.groups) {
    const { year, doy, hr, mins, secs, ms = '0'} = match.groups;
    return Date.UTC(+year, 0, +doy, +hr, +mins, +secs, +ms);
  }
  match = ISO_8601_UTC_REGEX.exec(isoOrUtcTime);
  if(match && match.groups){
    const {year, month, day, hr, mins, secs, ms = '0'} = match.groups;

    // Month is 0-indexed in Date.UTC
    const utcMonth = parseInt(month, 10) - 1;

    return Date.UTC(
      parseInt(year, 10),
      utcMonth,
      parseInt(day, 10),
      parseInt(hr, 10),
      parseInt(mins, 10),
      parseInt(secs, 10),
      parseInt(ms, 10)
    );
  }

  return 0;
}

/**
 * Calculates a Unix epoch time in UTC (milliseconds) from a starting ISO 8601 (UTC) time string and a Postgres interval duration string.
 *
 * @param {string} utcTime - An ISO 8601 formatted start time string.
 * @param {string} postgresInterval - A Postgres interval duration string.
 * @param {boolean} [includeMsecs=true] - Optional. If true, include milliseconds in the calculation if they are available.
 * @returns {number} The Unix epoch time in milliseconds.
 *
 * @example
 * const startTime = '2023-01-01T12:00:00Z';
 * const interval = '1 day 2 hours 30 minutes 15 seconds 500 milliseconds';
 * const epochTime = getUnixEpochTimeFromPostgresInterval(startTime, interval);
 * console.log(epochTime); // Output: (Unix epoch time in ms)
 *
 */
export function getUnixEpochTimeFromPostgresInterval(utcTime: string, postgresInterval: string, includeMsecs = true): number {
  const doyTime = isoFromUTCAndPostgresInterval(utcTime, postgresInterval, includeMsecs);
  return getUnixEpochTime(doyTime);
}

/**
 * Parses an ISO 8601 (UTC) string (YYYY-MM-DDTHH:mm:ssZ), a ISO Ordinal string (YYYY-DDDDTHH:mm:ss), a DOY string (DOYTHH:mm:ss), or a ISO 8601 Duration (P1Y2D) into its separate components.
 *
 * @param {string} dateString - The ISO 8601 (UTC), ISO Ordinal string, or DOY Duration string to parse.
 * @param {number} [numDecimals=6] - The number of decimal places to include for milliseconds.
 * @returns {null|ParsedDoyString|ParsedYmdString|ParsedDurationString} An object containing the parsed date/time components, or null if parsing fails.
 *
 * @example
 * parseDoyOrIsoTime('2023-12-25T12:30:45.123'); // returns { year: 2023, month: 12, day: 25, hour: 12, min: 30, sec: 45, ms: 123, time: '12:30:45.123' }
 * parseDoyOrIsoTime('2023-365T08:00:00'); // returns { year: 2023, doy: 365, hour: 8, min: 0, sec: 0, ms: 0, time: '08:00:00' }
 * parseDoyOrIsoTime('P1Y2D'); // returns { years:1 , days: 2, hours: 0, minutes: 0, seconds: 0, milliseconds: 0, microseconds: 0, isNegative: false}
 * parseDoyOrIsoTime('invalid-string'); // returns null
 *
 */
export function parseDoyOrIsoTime(
  dateString: string,
  numDecimals = 6,
): null | ParsedDoyString | ParsedYmdString | ParsedDurationString {
  dateString = dateString ?? ''
  const matchesOrdinal = ISO_ORDINAL_TIME_REGEX.exec(dateString);
  const matchesUTC = ISO_8601_UTC_REGEX.exec(dateString);
  
  const matches = matchesOrdinal || matchesUTC;  if (matches) {
    const msPerSecond = 1000;

    const { groups: { year, month, day, doy, hr = '0', mins = '0', secs = '0', ms = '0' } = {} } =
      matches;

    const partialReturn = {
      hour: parseInt(hr),
      min: parseInt(mins),
      ms: parseFloat((parseFloat(`.${ms}`) * msPerSecond).toFixed(numDecimals)),
      sec: parseInt(secs),
      time: `${hr}:${mins}:${secs}${ms !== '0' ? `.${ms}` : ''}`,
      year: parseInt(year),
    };

    if (doy !== undefined) {
      return {
        ...partialReturn,
        doy: parseInt(doy),
      };
    }

    return {
      ...partialReturn,
      day: parseInt(day),
      month: parseInt(month),
    };
  }

  const doyDuration = parseDOYDurationTime(dateString);
  if (doyDuration) {
    return doyDuration;
  }

  return null;
}

/**
 * Parses a DOY (Day of Year) duration time string into its components.
 *
 * @function parseDOYDurationTime
 * @param {string} doyTime - The DOY duration time string to parse (e.g., "P1DT2H30M15.500S" or "1.02:03:04.005").
 * @returns {ParsedDurationString|null} An object containing the parsed duration components, or null if parsing fails.
 *
 * @example
 * parseDOYDurationTime('P1DT2H30M15.500S'); // returns { days: 1, hours: 2, minutes: 30, seconds: 15, milliseconds: 500, microseconds: 0, years: 0, isNegative: false }
 * parseDOYDurationTime('1T02:03:04.005'); // returns { days: 1, hours: 2, minutes: 3, seconds: 4, milliseconds: 5, microseconds: 0, years: 0, isNegative: false }
 * parseDOYDurationTime('invalid-string'); // returns null
 */
export function parseDOYDurationTime(doyTime: string): ParsedDurationString | null {
  const matches = DOY_TIME_REGEX.exec(doyTime);
  if (matches !== null) {
    if (matches) {
      const { groups: { sign = '', doy = '0', hr = '0', mins = '0', secs = '0', ms = '0' } = {} } = matches;

      const hoursNum = parseInt(hr);
      const minuteNum = parseInt(mins);
      const secondsNum = parseInt(secs);
      const millisecondNum = parseFloat((parseFloat(`.${ms}`) * 1000).toFixed(6));

      return {
        days: doy !== undefined ? parseInt(doy) : 0,
        hours: hoursNum,
        isNegative: sign !== '' && sign !== '+',
        microseconds: 0,
        milliseconds: millisecondNum,
        minutes: minuteNum,
        seconds: secondsNum,
        years: 0,
      };
    }
  }
  return null;
}

/**
 * Returns a string indicating how long ago a date was compared to the given comparison date.
 * Optionally pass in `formatAsDateAfterMS` to override the default 23-hour cut-off in milliseconds,
 * after which the date will be formatted as "YYYY-MM-DD".
 *
 * @param {Date} date - The date to compare against the comparison date.
 * @param {Date} [comparisonDate=new Date()] - The date to compare to. Defaults to the current date and time.
 * @param {number} [formatAsDateAfterMS=82800000] - The milliseconds after which the date is formatted as "YYYY-MM-DD". Defaults to 23 hours.
 * @returns {string} A string representing the time difference (e.g., "10s ago", "5m ago", "YYYY-MM-DD").
 *
 * @example
 * getTimeAgo(new Date()); // returns "Now"
 * getTimeAgo(new Date(new Date().getTime() - 1000), new Date()); // returns "1s ago"
 * getTimeAgo(new Date(new Date().getTime() - 86400000), new Date()); // returns "YYYY-MM-DD" (where YYYY-MM-DD is the date from 24 hours ago)
 *
 */
export function getTimeAgo(
  date: Date,
  comparisonDate: Date = new Date(),
  formatAsDateAfterMS: number = 1000 * 60 * 60 * 23,
) {
  const comparisonDateTime = comparisonDate.getTime();
  const diff = comparisonDateTime - date.getTime();
  if (diff < 1000) {
    return 'Now';
  }
  // Format as mm-dd-YYYY if over limit
  if (diff > formatAsDateAfterMS) {
    return date.toISOString().slice(0, 10);
  }
  return `${usToDurationString((comparisonDateTime - date.getTime()) * 1000).split(' ')[0]} ago`;
}

/**
 * Returns a date formatted as an ISO 8601 (UTC) string, truncated to remove milliseconds and the timezone identifier.
 *
 * @param {Date} date - The Date object to format.
 * @returns {string} The date formatted as "YYYY-MM-DDTHH:mm:ss".
 *
 * @example
 * getShortUtcForDate(new Date("2023-05-23T00:30:09.597Z")); // returns '2023-05-23T00:30:09'
 */
export function getShortUtcForDate(date: Date) {
  return date.toISOString().slice(0, 19);
}

/**
 * Returns the short time zone name for the user's current locale.
 *
 * @returns {string} The short time zone name (e.g., "PST", "EST").
 *
 * @example
 * getShortTimeZoneName(); // returns "PST", "EST", or other short time zone name based on the user's locale.
 */
export function getShortTimeZoneName() {
  return new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).format(new Date());
}

/**
 * Returns the short time zone name for the user's current locale, extracted from Intl.DateTimeFormat parts.
 *
 * @returns {string} The short time zone name (e.g., "PST", "EST"), or "UNK" if extraction fails.
 *
 * @example
 * getTimeZoneName(); // returns "PST", "EST", or other short time zone name based on the user's locale, or "UNK" if not available.
 */
export function getTimeZoneName() {
  // set up formatter
  const formatter = new Intl.DateTimeFormat(undefined, {
    timeZoneName: 'short',
  });
  // run formatter on current date
  const parts = formatter?.formatToParts(Date.now());
  // extract the actual value from the formatter
  const timeZoneName = parts.find(formatted => formatted.type === 'timeZoneName');
  if (timeZoneName) {
    return timeZoneName.value;
  }
  return 'UNK';
}

/**
 * Removes milliseconds from a date string if it's in ISO Ordinal or ISO 8601 (UTC) time format.
 * If the string is not a recognized time format, it returns the original string unchanged.
 *
 * @param {string} dateString - The date string to process.
 * @returns {string} The date string with milliseconds removed, or the original string if no milliseconds were present or the format wasn't recognized.
 *
 * @example
 * removeUtcOrIsoStringMilliseconds('2023-365T12:30:45.123'); // returns '2023-365T12:30:45'
 * removeUtcOrIsoStringMilliseconds('2023-12-25T08:00:00.500Z'); // returns '2023-12-25T08:00:00Z'
 * removeUtcOrIsoStringMilliseconds('invalid-string'); // returns 'invalid-string'
 *
 */
export function removeUtcOrIsoStringMilliseconds(utcOrIsoString: string): string {
  if (validateTime(utcOrIsoString, TimeTypes.ISO_ORDINAL_TIME)) {
    return utcOrIsoString.split('.')[0];
  }
  if(validateTime(utcOrIsoString, TimeTypes.ISO_8601_UTC_TIME)){
    return utcOrIsoString.split('.')[0];
  }
  return utcOrIsoString;
}
