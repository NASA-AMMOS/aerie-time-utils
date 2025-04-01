import { TimeTypes } from './enums/time.js';
import type { DurationTimeComponents, ParsedDoyString, ParsedDurationString, ParsedYmdString } from './types/time.js';
/**
 * Validates a time string based on the specified type.
 * @param {string} time - The time string to validate.
 * @param {TimeTypes} type - The type of time to validate against.
 * @returns {boolean} - True if the time string is valid, false otherwise.
 * @example
 * validateTime('2022-012T12:34:56.789', TimeTypes.ABSOLUTE); // true
 * validateTime('P1DT2H30M', TimeTypes.RELATIVE); // returns true
 * validateTime('P1DT2H30M', TimeTypes.ABSOLUTE); // returns false
 * validateTime('invalid-string', TimeTypes.ABSOLUTE); // returns false
 */
export declare function validateTime(time: string, type: TimeTypes): boolean;
/**
 * Determines if the given time string represents a maximum time value based on the specified time type.
 *
 * @param {string} time - The time string to check.
 * @param {TimeTypes} type - The time type to check against.
 * @returns {boolean} - True if the time string is a max time, false otherwise.
 * @example
 * isTimeMax('2099-365T23:59:59.999', TimeTypes.ABSOLUTE); // false
 * isTimeMax('-365T23:59:60.999', TimeTypes.EPOCH)) // true

 */
export declare function isTimeMax(time: string, type: TimeTypes): boolean;
/**
 * Determines if the given time string is balanced based on the specified time type.
 * @param {string} time - The time string to check.
 * @param {TimeTypes} type - The time type to check against.
 * @returns {boolean} - True if the time string is balanced, false otherwise.
 * @example
 * isTimeBalanced('2022-01-01T00:00:00.000', TimeTypes.ABSOLUTE); // true
 * isTimeBalanced('50000d', TimeTypes.RELATIVE); // false
 */
export declare function isTimeBalanced(time: string, type: TimeTypes): boolean;
/**
 * Parse a duration string into a parsed duration object.
 * If no unit is specified, it defaults to microseconds.
 *
 * @param {string} durationString - The duration string to parse.
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
export declare function parseDurationString(durationString: string, units?: 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds' | 'microseconds'): ParsedDurationString | never;
/**
 * Gets the balanced duration based on the given time string.
 *
 * @param {string} time - The time string to calculate the balanced duration from.
 * @returns {string} The balanced duration string.
 *
 * @example
 * getBalancedDuration('-002T00:60:00.010') // => '-002T01:00:00.010'
 * getBalancedDuration('+190')) //=> '00:03:10.000'
 *
 */
export declare function getBalancedDuration(time: string): string;
/**
 * Converts a Day of Year (DOY) string in 'YYYY-DDDDTHH:mm:ss' format into a 'YYYY-MM-DDTHH:mm:ss' formatted time string.
 *
 * If the input `doyString` is already in 'YYYY-MM-DDTHH:mm:ss' format, it will be returned as-is with a 'Z' suffix.
 *
 * @param {string} doyString - The DOY string to convert, e.g., "2023-154T12:34:56".
 * @param {boolean} [includeMsecs=true] - Whether to include milliseconds in the output.
 * @returns {string | null} - A formatted date string in 'YYYY-MM-DDTHH:mm:ss[.mmm...]Z' format, or null if parsing fails.
 *
 * @example
 * convertDoyToYmd('2023-154T12:34:56') // returns '2023-05-30T12:34:56Z'
 * convertDoyToYmd('2023-154T12:34:56.789', false) // returns '2023-05-30T12:34:56Z'
 * convertDoyToYmd('2023-05-30T12:34:56') // returns '2023-05-30T12:34:56Z'
 */
export declare function convertDoyToYmd(doyString: string, includeMsecs?: boolean): string | null;
/**
 * Converts a duration string into a PostgreSQL INTERVAL formatted string.
 *
 * The function accepts duration strings in various formats (e.g., "2y", "318d", "6h", "16m")
 * and returns a properly formatted Postgres interval. The input string must contain at least one unit of time.
 *
 * @param {string} durationString - A string representing a duration in units like years, days, hours, etc.
 * @returns {string} - Returns the duration string formatted as a PostgreSQL INTERVAL.
 *
 * @example
 * convertDurationStringToInterval('8d 6h 16m') // returns '8 days 6 hours 16 minutes'
 */
export declare function convertDurationStringToPGInterval(durationString: string): string | never;
/**
 * Converts a Postgres UTC date string to the number of milliseconds since the epoch (January 1, 1970 UTC).
 * This is useful for rendering purposes where you need to convert a date string into a timestamp.
 *
 * @param {string} date - A valid Postgres UTC date string in 'YYYY-MM-DDTHH:mm:ss' format.
 * @returns {number} - The number of milliseconds since the Unix epoch (1970-01-01T00:00:00Z).
 *
 * @example
 * pgUTCToMs('2023-10-05T14:30:00') // returns 1633446600000
 *
 */
export declare function pgUTCToMs(date: string): number;
/**
 * Converts a duration string into a number representing microseconds.
 *
 * The input string should be in the format '2y 318d 6h 16m 19s 200ms 0us'
 *
 * This function parses each component of the duration string, converts it into microseconds,
 * sums them up, and returns the total. If the input string represents a negative duration,
 * the returned value will be negative.
 *
 * @param {string} durationString - The duration string to convert.
 * @returns {number} - The number of microseconds represented by the input string.
 *
 * @example
 * convertDurationStringToUs('2y 318d 6h 16m 19s 200ms 0us') // returns 90577779200000
 *
 * @note This function is the inverse of `convertUsToDurationString`.
 *
 */
export declare function convertDurationStringToUs(durationString: string): number | never;
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
 * convertUsToDurationString(90577779200000) // returns '2y 318d 6h 16m 19s 200ms'

 * @note inverse of convertDurationStringToUs
 */
export declare function convertUsToDurationString(durationUs: number, includeZeros?: boolean): string;
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
 * getDaysInMonth(2020, 5); // returns 3 (June has 3 days? Wait, that's not correct. June should have 30 days.)
 * getDaysInMonth(2020, 1); // returns 29 (February in a leap year)
 */
export declare function getDaysInMonth(year: number, month: number): number;
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
 * getDaysInYear(2024); // 366
 */
export declare function getDaysInYear(year: number): number;
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
export declare function getDoy(date: Date): number;
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
export declare function getDoyTimeComponents(date: Date): {
    doy: string;
    hours: string;
    mins: string;
    msecs: string;
    secs: string;
    year: string;
};
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
export declare function getDurationTimeComponents(duration: ParsedDurationString): DurationTimeComponents;
/**
 * Get a day-of-year (DOY) timestamp from a given JavaScript Date object.
 *
 * @param {Date} date - The JavaScript Date object to convert to a DOY timestamp.
 * @param {boolean} [includeMsecs=true] - Optional. If true, include milliseconds in the timestamp if they are non-zero.
 * @returns {string} The DOY timestamp in the format "YYYY-DOYTHH:MM:SS[.mmm]".
 *
 * @example
 * getDoyTime(new Date(1577779200000)) // returns "2019-365T08:00:00"
 * getDoyTime(new Date(1577779200123)) // returns "2019-365T08:00:00.123"
 * getDoyTime(new Date(1577779200123), false) // returns "2019-365T08:00:00"
 *
 * @note Inverse of getUnixEpochTime.
 * @note Milliseconds will be dropped if they are all zeros or if includeMsecs is false.
 */
export declare function getDoyTime(date: Date, includeMsecs?: boolean): string;
/**
 * Get a day-of-year (DOY) timestamp from a given ISO 8601 start time string and a Postgres Interval duration.
 *
 * @param {string} startTime - An ISO 8601 formatted start time string.
 * @param {string} interval - A Postgres Interval duration string.
 * @param {boolean} [includeMsecs=true] - Optional. If true, include milliseconds in the timestamp if they are non-zero.
 * @returns {string} The DOY timestamp in the format "YYYY-DOYTHH:MM:SS[.mmm]".
 *
 * @example
 * const startTime = '2023-01-01T12:00:00Z';
 * const interval = '1 day 2 hours 30 minutes 15 seconds 500 milliseconds';
 * const doyTimestamp = getDoyTimeFromInterval(startTime, interval);
 * console.log(doyTimestamp); // Output: "2023-002T14:30:15.500"
 *
 * @note Requires a `parseInterval` function to be available in scope.
 */
export declare function getDoyTimeFromInterval(startTime: string, interval: string, includeMsecs?: boolean): string;
/**
 * Returns a Postgres Interval duration in milliseconds.
 * If the duration is null, undefined, or an empty string, it returns 0.
 *
 * @param {string|null|undefined} interval - The Postgres Interval duration string.
 * @returns {number} The duration in milliseconds.
 *
 * @example
 * const interval = '1 day 2 hours 30 minutes 15 seconds 500 milliseconds';
 * const milliseconds = getIntervalInMs(interval);
 * console.log(milliseconds); // Output: 94815500
 *
 * @example
 * const nullInterval = null;
 * const nullResult = getIntervalInMs(nullInterval);
 * console.log(nullResult); //Output: 0
 *
 * @note This function assumes 24-hour days.
 * @note Requires a `parseInterval` function to be available in scope.
 *
 */
export declare function getPBIntervalInMs(interval: string | null | undefined): number;
/**
 * Returns a Postgres Interval duration string representing the difference between two DOY (Day of Year) timestamp strings.
 *
 * @param {string} startTime - The starting DOY timestamp string (e.g., "YYYY-DOYTHH:MM:SS[.mmm]").
 * @param {string} endTime - The ending DOY timestamp string (e.g., "YYYY-DOYTHH:MM:SS[.mmm]").
 * @returns {string} A Postgres Interval duration string.
 *
 * @example
 * const startTime = '2023-001T00:00:00';
 * const endTime = '2023-002T12:30:45.123';
 * const interval = getIntervalFromDoyRange(startTime, endTime);
 * console.log(interval); // Output: (e.g., "1 day 12 hours 30 minutes 45 seconds 123 milliseconds")
 *
 */
export declare function getPBIntervalFromDoyRange(startTime: string, endTime: string): string;
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
 * const interval2 = getIntervalUnixEpochTime(startTime2, endTime2);
 * console.log(interval2); // Output: "-24:30:45.123"
 *
 * @note This function returns a simplified interval format, without "days" or "years" components.
 */
export declare function getPGIntervalUnixEpochTime(startTimeMs: number, endTimeMs: number): string;
/**
 * Get a Unix epoch time in milliseconds given a day-of-year (DOY) timestamp string.
 *
 * @function getUnixEpochTime
 * @param {string} doyTimestamp - The DOY timestamp string in the format "YYYY-DOYTHH:MM:SS[.mmm]".
 * @returns {number} The Unix epoch time in milliseconds. Returns 0 if the timestamp is invalid.
 *
 * @example
 * getUnixEpochTime('2019-365T08:00:00.000') // returns 1577779200000
 *
 * @note Inverse of getDoyTime.
 */
export declare function getUnixEpochTime(doyTimestamp: string): number;
/**
 * Calculates a Unix epoch time in UTC (milliseconds) from a starting ISO 8601 time string and a Postgres interval duration string.
 *
 * @param {string} startTime - An ISO 8601 formatted start time string.
 * @param {string} interval - A Postgres interval duration string.
 * @param {boolean} [includeMsecs=true] - Optional. If true, include milliseconds in the calculation if they are available.
 * @returns {number} The Unix epoch time in milliseconds.
 *
 * @example
 * const startTime = '2023-01-01T12:00:00Z';
 * const interval = '1 day 2 hours 30 minutes 15 seconds 500 milliseconds';
 * const epochTime = getUnixEpochTimeFromInterval(startTime, interval);
 * console.log(epochTime); // Output: (Unix epoch time in ms)
 *
 */
export declare function getUnixEpochTimeFromPGInterval(startTime: string, interval: string, includeMsecs?: boolean): number;
/**
 * Parses a date string (YYYY-MM-DDTHH:mm:ss), a DOY string (YYYY-DDDDTHH:mm:ss), or a DOY Duration string into its separate components.
 *
 * @param {string} dateString - The date, DOY, or DOY Duration string to parse.
 * @param {number} [numDecimals=6] - The number of decimal places to include for milliseconds.
 * @returns {null|ParsedDoyString|ParsedYmdString|ParsedDurationString} An object containing the parsed date/time components, or null if parsing fails.
 *
 * @example
 * parseDoyOrYmdTime('2023-12-25T12:30:45.123'); // returns { year: 2023, month: 12, day: 25, hour: 12, min: 30, sec: 45, ms: 123, time: '12:30:45.123' }
 * parseDoyOrYmdTime('2023-365T08:00:00'); // returns { year: 2023, doy: 365, hour: 8, min: 0, sec: 0, ms: 0, time: '08:00:00' }
 * parseDoyOrYmdTime('P1Y2D'); // returns { years:1 , days: 2, hours: 0, minutes: 0, seconds: 0, milliseconds: 0, microseconds: 0, isNegative: false}
 * parseDoyOrYmdTime('invalid-string'); // returns null
 *
 */
export declare function parseDoyOrYmdTime(dateString: string, numDecimals?: number): null | ParsedDoyString | ParsedYmdString | ParsedDurationString;
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
export declare function getTimeAgo(date: Date, comparisonDate?: Date, formatAsDateAfterMS?: number): string;
/**
 * Returns a date formatted as an ISO 8601 string, truncated to remove milliseconds and the timezone identifier.
 *
 * @param {Date} date - The Date object to format.
 * @returns {string} The date formatted as "YYYY-MM-DDTHH:mm:ss".
 *
 * @example
 * getShortISOForDate(new Date("2023-05-23T00:30:09.597Z")); // returns '2023-05-23T00:30:09'
 */
export declare function getShortISOForDate(date: Date): string;
/**
 * Returns the short time zone name for the user's current locale.
 *
 * @returns {string} The short time zone name (e.g., "PST", "EST").
 *
 * @example
 * getShortTimeZoneName(); // returns "PST", "EST", or other short time zone name based on the user's locale.
 */
export declare function getShortTimeZoneName(): string;
/**
 * Returns the short time zone name for the user's current locale, extracted from Intl.DateTimeFormat parts.
 *
 * @returns {string} The short time zone name (e.g., "PST", "EST"), or "UNK" if extraction fails.
 *
 * @example
 * getTimeZoneName(); // returns "PST", "EST", or other short time zone name based on the user's locale, or "UNK" if not available.
 */
export declare function getTimeZoneName(): string;
/**
 * Removes milliseconds from a date string if it's in DOY (Day of Year) or ISO 8601 time format.
 * If the string is not a recognized time format, it returns the original string unchanged.
 *
 * @param {string} dateString - The date string to process.
 * @returns {string} The date string with milliseconds removed, or the original string if no milliseconds were present or the format wasn't recognized.
 *
 * @example
 * removeDateStringMilliseconds('2023-365T12:30:45.123'); // returns '2023-365T12:30:45'
 * removeDateStringMilliseconds('2023-12-25T08:00:00.500Z'); // returns '2023-12-25T08:00:00Z'
 * removeDateStringMilliseconds('invalid-string'); // returns 'invalid-string'
 *
 */
export declare function removeDateStringMilliseconds(dateString: string): string;
//# sourceMappingURL=timeUtils.d.ts.map