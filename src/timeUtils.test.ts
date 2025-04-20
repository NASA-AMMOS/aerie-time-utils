import { expect, test } from 'vitest';
import {
  convertDoyOrIsoToUtc,
  durationStringToPostgresInterval,
  durationStringToUs,
  usToDurationString,
  utcToMs,
  getBalancedDuration,
  getDaysInMonth,
  getDaysInYear,
  getDoy,
  isoFromJSDate,
  getDoyTimeComponents,
  getDurationTimeComponents,
  getShortUtcForDate,
  getTimeAgo,
  getUnixEpochTime,
  isTimeBalanced,
  isTimeMax,
  parseDoyOrIsoTime,
  parseDurationString,
  removeUtcOrIsoStringMilliseconds,
  validateTime,
} from './timeUtils.js';
import { TimeTypes } from './enums/time.js';

test('durationStringToUs', () => {
  expect(durationStringToUs('2y 318d 6h 16m 19s 200ms 0us')).toEqual(90577779200000);
  expect(durationStringToUs('100ms -1000us')).toEqual(99000);
  expect(durationStringToUs('200ms 0us')).toEqual(200000);
  expect(durationStringToUs('30s')).toEqual(3e7);
  expect(durationStringToUs('045T10:05:02.001')).toEqual(3924302001000);
  expect(durationStringToUs('300')).toEqual(300);
  expect(() => durationStringToUs('30f')).toThrowError(`Invalid time format: Must be of format:
    1y 3d 2h 24m 35s 18ms 70us,
    [+/-]DOYThh:mm:ss[.sss],
    duration
    `);
});

test('utcToMs', () => {
  // standard date conversion
  expect(utcToMs('2024-01-01T00:00:00Z')).toEqual(1704067200000);

  // DOY doesn't work
  expect(utcToMs('2024-001T00:00:00Z')).toEqual(NaN);

  // conversion to DOY is fine if the time zone ("Z") is excluded
  expect(utcToMs(convertDoyOrIsoToUtc('2024-001T00:00:00') ?? '')).toEqual(1704067200000);

  // conversion without a timezone in the input - this is compared to a new Date object in order to use the test runner's machine's timezone (as the result of convertutcToMs should follow *that* timezone)
  expect(utcToMs('2024-01-01 00:00:00')).toEqual(new Date('2024-01-01 00:00:00').getTime());

  // any other string fails
  expect(utcToMs('not a date')).toEqual(NaN);
});

test('convertDurationStringToInterval', () => {
  expect(durationStringToPostgresInterval('2y 318d 6h 16m 19s 200ms 0us')).toEqual(
    '2 years 318 days 6 hours 16 minutes 19 seconds 200 milliseconds',
  );
  expect(durationStringToPostgresInterval('1d 5h 23m 0s 300ms')).toEqual('1 day 5 hours 23 minutes 300 milliseconds');
  expect(durationStringToPostgresInterval('1d -5h')).toEqual('19 hours');
  expect(durationStringToPostgresInterval('- 5h 23m 0s 300ms')).toEqual('-5 hours -23 minutes -300 milliseconds');
  expect(durationStringToPostgresInterval('30')).toEqual('30 microseconds');
  expect(durationStringToPostgresInterval('001T00:01:00') ).toEqual('1 day 1 minute')

  expect(() => durationStringToUs('30f')).toThrowError(`Invalid time format: Must be of format:
    1y 3d 2h 24m 35s 18ms 70us,
    [+/-]DOYThh:mm:ss[.sss],
    duration
    `);
});

test('usToDurationString', () => {
  expect(usToDurationString(90577779200000)).toEqual('2y 318d 6h 16m 19s 200ms');
  expect(usToDurationString(200000)).toEqual('200ms');
  expect(usToDurationString(3e7)).toEqual('30s');
  expect(usToDurationString(-8.64e10)).toEqual('- 1d');
});

test('convertDoyOrIsoToUtc', () => {
  expect(convertDoyOrIsoToUtc('2023-001T00:10:12', false)).toEqual('2023-01-01T00:10:12Z');
  expect(convertDoyOrIsoToUtc('2023-001T00:00:00', false)).toEqual('2023-01-01T00:00:00Z');
  expect(convertDoyOrIsoToUtc('2023-032T00:00:00', false)).toEqual('2023-02-01T00:00:00Z');
  expect(convertDoyOrIsoToUtc('2023-048T10:32:44.123', true)).toEqual('2023-02-17T10:32:44.123Z');
  expect(convertDoyOrIsoToUtc('2023-04-10T10:32:44.123Z', true)).toEqual('2023-04-10T10:32:44.123Z');
  expect(convertDoyOrIsoToUtc('2023-04-10T10:32:44.123', true)).toEqual('2023-04-10T10:32:44.123Z');
  expect(convertDoyOrIsoToUtc('2023-048T10:32:44.123', false)).toEqual('2023-02-17T10:32:44Z');
});

test('getDaysInMonth', () => {
  expect(getDaysInMonth(2022, 0)).toEqual(31);
  expect(getDaysInMonth(2022, 1)).toEqual(28);

  expect(getDaysInMonth(2024, 0)).toEqual(31);
  expect(getDaysInMonth(2024, 1)).toEqual(29);
});

test('getDaysInYear', () => {
  expect(getDaysInYear(2020)).toEqual(366);
  expect(getDaysInYear(2021)).toEqual(365);
  expect(getDaysInYear(2022)).toEqual(365);
  expect(getDaysInYear(2023)).toEqual(365);
  expect(getDaysInYear(2024)).toEqual(366);
  expect(getDaysInYear(2025)).toEqual(365);
});

test('getDoy', () => {
  const doy = getDoy(new Date('1/3/2019'));
  expect(doy).toEqual(3);
});

test('getDoyTimeComponents', () => {
  const doyTimeComponents = getDoyTimeComponents(new Date(1683148238813));
  expect(doyTimeComponents).deep.equal({
    doy: '123',
    hours: '21',
    mins: '10',
    msecs: '813',
    secs: '38',
    year: '2023',
  });
});

test('isoFromJSDate', () => {
  const doyTime = isoFromJSDate(new Date(1577779200000));
  expect(doyTime).toEqual('2019-365T08:00:00');
});

test('getUnixEpochTime', () => {
  const unixEpochTime = getUnixEpochTime('2019-365T08:00:00.000');
  expect(unixEpochTime).toEqual(1577779200000);
});

test('parseDoyOrIsoTime', () => {
  expect(parseDoyOrIsoTime('2019-365T08:00:00.1234')).toEqual({
    doy: 365,
    hour: 8,
    min: 0,
    ms: 123.4,
    sec: 0,
    time: '08:00:00.1234',
    year: 2019,
  });

  expect(parseDoyOrIsoTime('2019-01-20T08:10:03.9Z')).toEqual({
    day: 20,
    hour: 8,
    min: 10,
    month: 1,
    ms: 900,
    sec: 3,
    time: '08:10:03.9',
    year: 2019,
  });

  expect(parseDoyOrIsoTime('2022-01-02T00:00:00Z')).toEqual({
    day: 2,
    hour: 0,
    min: 0,
    month: 1,
    ms: 0,
    sec: 0,
    time: '00:00:00',
    year: 2022,
  });

  expect(parseDoyOrIsoTime('2022-10-02T00:00:00Z')).toEqual({
    day: 2,
    hour: 0,
    min: 0,
    month: 10,
    ms: 0,
    sec: 0,
    time: '00:00:00',
    year: 2022,
  });

  expect(parseDoyOrIsoTime('012T03:01:30.920')).toEqual({
    days: 12,
    hours: 3,
    isNegative: false,
    microseconds: 0,
    milliseconds: 920,
    minutes: 1,
    seconds: 30,
    years: 0,
  });

  expect(parseDoyOrIsoTime('-112T13:41:00')).toEqual({
    days: 112,
    hours: 13,
    isNegative: true,
    microseconds: 0,
    milliseconds: 0,
    minutes: 41,
    seconds: 0,
    years: 0,
  });

  expect(parseDoyOrIsoTime('2019-365T08:80:00.1234')).toEqual({
    doy: 365,
    hour: 8,
    min: 80,
    ms: 123.4,
    sec: 0,
    time: "08:80:00.1234",
    year: 2019,
  });
  expect(parseDoyOrIsoTime('2022-20-2T00:00:00')).toEqual(null);
});

test('getTimeAgo', () => {
  const time = new Date('2023-05-23T00:00:00.000Z');
  expect(getTimeAgo(new Date())).toEqual('Now');
  expect(getTimeAgo(new Date(time.getTime() - 100), time)).toEqual('Now');
  expect(getTimeAgo(new Date(time.getTime() - 1000), time)).toEqual('1s ago');
  expect(getTimeAgo(new Date(time.getTime() - 1000 * 60), time)).toEqual('1m ago');
  expect(getTimeAgo(new Date(time.getTime() - 1000 * 60 * 60), time)).toEqual('1h ago');
  expect(getTimeAgo(new Date(time.getTime() - 1000 * 60 * 60 * 23), time)).toEqual('23h ago');
  expect(getTimeAgo(new Date(time.getTime() - 1000 * 60 * 60 * 24), time)).toEqual('2023-05-22');
  expect(getTimeAgo(new Date(time.getTime() - 1000 * 60 * 60 * 24), time, 1000 * 60 * 60 * 24)).toEqual('1d ago');
  expect(getTimeAgo(new Date(time.getTime() - 1000 * 60 * 60 * 24 * 366), time, 1000 * 60 * 60 * 24 * 366)).toEqual(
    '1y ago',
  );
});

test('getShortUtcForDate', () => {
  expect(getShortUtcForDate(new Date('2023-05-23T00:00:00.000Z'))).toEqual('2023-05-23T00:00:00');
});

test('parseDurationString', () => {
  expect(parseDurationString('1h 30m 45s')).toEqual({
    days: 0,
    hours: 1,
    isNegative: false,
    microseconds: 0,
    milliseconds: 0,
    minutes: 30,
    seconds: 45,
    years: 0,
  });

  expect(parseDurationString('-2d 12h 30m 15.5s 250ms')).toEqual({
    days: 2,
    hours: 12,
    isNegative: true,
    microseconds: 0,
    milliseconds: 250,
    minutes: 30,
    seconds: 15.5,
    years: 0,
  });

  expect(parseDurationString('500us')).toEqual({
    days: 0,
    hours: 0,
    isNegative: false,
    microseconds: 500,
    milliseconds: 0,
    minutes: 0,
    seconds: 0,
    years: 0,
  });

  expect(parseDurationString('1000')).toEqual({
    days: 0,
    hours: 0,
    isNegative: false,
    microseconds: 1000,
    milliseconds: 0,
    minutes: 0,
    seconds: 0,
    years: 0,
  });

  expect(parseDurationString('-1000', 'seconds')).toEqual({
    days: 0,
    hours: 0,
    isNegative: true,
    microseconds: 0,
    milliseconds: 0,
    minutes: 16,
    seconds: 40,
    years: 0,
  });

  expect(parseDurationString('+100000000000')).toEqual({
    days: 0,
    hours: 0,
    isNegative: false,
    microseconds: 0,
    milliseconds: 0,
    minutes: 1,
    seconds: 40,
    years: 0,
  });

  expect(parseDurationString('-366', 'days')).toEqual({
    days: 1,
    hours: 0,
    isNegative: true,
    microseconds: 0,
    milliseconds: 0,
    minutes: 0,
    seconds: 0,
    years: 1,
  });

  expect(parseDurationString('1.1', 'days')).toEqual({
    days: 1,
    hours: 0.1,
    isNegative: false,
    microseconds: 0,
    milliseconds: 0,
    minutes: 0,
    seconds: 0,
    years: 0,
  });

  expect(parseDurationString('1.01', 'minutes')).toEqual({
    days: 0,
    hours: 0,
    isNegative: false,
    microseconds: 0,
    milliseconds: 0,
    minutes: 1,
    seconds: 0.01,
    years: 0,
  });

  expect(parseDurationString('24:00:00')).toEqual({
    days: 0,
    hours: 24,
    isNegative: false,
    microseconds: 0,
    milliseconds: 0,
    minutes: 0,
    seconds: 0,
    years: 0,
  });
});

test('getDurationTimeComponents', () => {
  expect(
    getDurationTimeComponents({
      days: 3,
      hours: 10,
      isNegative: false,
      microseconds: 0,
      milliseconds: 0,
      minutes: 30,
      seconds: 45,
      years: 2,
    }),
  ).toEqual({
    days: '003',
    hours: '10',
    isNegative: '',
    microseconds: '',
    milliseconds: '',
    minutes: '30',
    seconds: '45',
    years: '0002',
  });

  expect(
    getDurationTimeComponents({
      days: 300,
      hours: 2,
      isNegative: true,
      microseconds: 1,
      milliseconds: 123,
      minutes: 1,
      seconds: 2,
      years: 0,
    }),
  ).toEqual({
    days: '300',
    hours: '02',
    isNegative: '-',
    microseconds: '001',
    milliseconds: '123',
    minutes: '01',
    seconds: '02',
    years: '0000',
  });

  expect(
    getDurationTimeComponents({
      days: 0,
      hours: 0,
      isNegative: false,
      microseconds: 123,
      milliseconds: 0,
      minutes: 0,
      seconds: 2,
      years: 0,
    }),
  ).toEqual({
    days: '',
    hours: '00',
    isNegative: '',
    microseconds: '123',
    milliseconds: '',
    minutes: '00',
    seconds: '02',
    years: '0000',
  });
});

test('isTimeBalanced', () => {
  expect(isTimeBalanced('2024-001T00:00:00', TimeTypes.ISO_ORDINAL_TIME)).toBe(true);
  expect(isTimeBalanced('2024-001T12:90:00', TimeTypes.ISO_ORDINAL_TIME)).toBe(false);
  expect(isTimeBalanced('9999-365T23:59:60.999', TimeTypes.ISO_ORDINAL_TIME)).toBe(false);
  expect(isTimeBalanced('2024-365T23:59:60', TimeTypes.ISO_ORDINAL_TIME)).toBe(false);
  expect(isTimeBalanced('2023-363T23:19:30', TimeTypes.ISO_ORDINAL_TIME)).toBe(true);
  expect(isTimeBalanced('0000-000T00:00:00', TimeTypes.ISO_ORDINAL_TIME)).toBe(false);
  expect(isTimeBalanced('0000-000T24:60:60', TimeTypes.ISO_ORDINAL_TIME)).toBe(false);
  expect(isTimeBalanced('001T12:43:20.000', TimeTypes.DOY_TIME)).toBe(true);
  expect(isTimeBalanced('09:04:00.340', TimeTypes.DOY_TIME)).toBe(true);
  expect(isTimeBalanced('001T23:59:60.000', TimeTypes.DOY_TIME)).toBe(false);
  expect(isTimeBalanced('365T23:59:60.000', TimeTypes.DOY_TIME)).toBe(false);
  expect(isTimeBalanced('24:60:60', TimeTypes.DOY_TIME)).toBe(false);
  expect(isTimeBalanced('+001T12:43:20.000', TimeTypes.DOY_TIME)).toBe(true);
  expect(isTimeBalanced('-09:04:00.340', TimeTypes.DOY_TIME)).toBe(true);
  expect(isTimeBalanced('-001T23:59:60.000', TimeTypes.DOY_TIME)).toBe(false);
  expect(isTimeBalanced('-365T23:59:60.000', TimeTypes.DOY_TIME)).toBe(false);
  expect(isTimeBalanced('365T22:59:60.000', TimeTypes.DOY_TIME)).toBe(false);
});

test('getBalancedDuration', () => {
  expect(getBalancedDuration('001T23:59:60.1')).toBe('002T00:00:00.100');
  expect(getBalancedDuration('24:60:60')).toBe('001T01:01:00.000');
  expect(getBalancedDuration('1')).toBe('00:00:01.000');
  expect(getBalancedDuration('-10')).toBe('-00:00:10.000');
  expect(getBalancedDuration('45600')).toBe('12:40:00.000');
  expect(getBalancedDuration('-001T00:59:10.000')).toBe('-001T00:59:10.000');
  expect(getBalancedDuration('-365T22:59:60.999')).toBe('-365T23:00:00.999');
  expect(getBalancedDuration('-1')).toBe('-00:00:01.000');
  expect(getBalancedDuration('+190')).toBe('00:03:10.000');
  expect(getBalancedDuration('00:00:00.001')).toBe('00:00:00.001');
});

test('isTimeMax', () => {
  expect(isTimeMax('9999-365T23:59:60.999', TimeTypes.ISO_ORDINAL_TIME)).toBe(true);
  expect(isTimeMax('365T23:59:60.999', TimeTypes.DOY_TIME)).toBe(true);
  expect(isTimeMax('365T23:59:60.000', TimeTypes.DOY_TIME)).toBe(true);
  expect(isTimeMax('-365T23:59:60.999', TimeTypes.DOY_TIME)).toBe(true);
  expect(isTimeMax('365T22:59:60.999', TimeTypes.DOY_TIME)).toBe(false);
  expect(isTimeMax('2023-10-27T10:30:00Z', TimeTypes.ISO_8601_UTC_TIME)).toBe(false);
});

test('validateTime', () => {
  expect(validateTime('2024-001T00:00:00', TimeTypes.ISO_ORDINAL_TIME)).toBe(true);
  expect(validateTime('2024-001T', TimeTypes.ISO_ORDINAL_TIME)).toBe(false);
  expect(validateTime('12:90:00', TimeTypes.ISO_ORDINAL_TIME)).toBe(false);
  expect(validateTime('-001T23:59:60.000', TimeTypes.DOY_TIME)).toBe(true);
  expect(validateTime('365T23:59:60.000', TimeTypes.DOY_TIME)).toBe(true);
  expect(validateTime('-03:59:60.000', TimeTypes.DOY_TIME)).toBe(true);
  expect(validateTime('+03:59:60.000', TimeTypes.DOY_TIME)).toBe(true);
  expect(validateTime('03:59:60.190', TimeTypes.DOY_TIME)).toBe(true);
  expect(validateTime('2023-365T23:59:60', TimeTypes.DOY_TIME)).toBe(false);
  expect(validateTime('2023-365T23:59:60', TimeTypes.DOY_TIME)).toBe(false);
  expect(validateTime('-001T23:59:60.000', TimeTypes.DOY_TIME)).toBe(true);
  expect(validateTime('365T23:59:60.000', TimeTypes.DOY_TIME)).toBe(true);
  expect(validateTime('+03:59:60.000', TimeTypes.DOY_TIME)).toBe(true);
  expect(validateTime('3:59:60', TimeTypes.DOY_TIME)).toBe(false);
  expect(validateTime('2023-10-27T10:30:00Z', TimeTypes.ISO_8601_UTC_TIME)).toBe(true);
});

test('removeUtcOrIsoStringMilliseconds', () => {
  expect(removeUtcOrIsoStringMilliseconds('2024-001T00:00:00.593')).toBe('2024-001T00:00:00');
  expect(removeUtcOrIsoStringMilliseconds('2023-10-27T10:30:00.12Z')).toBe('2023-10-27T10:30:00');
  expect(removeUtcOrIsoStringMilliseconds('123456.593')).toBe('123456.593');
});
