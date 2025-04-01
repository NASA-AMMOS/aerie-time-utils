"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const timeUtils_js_1 = require("./timeUtils.js");
const time_js_1 = require("./enums/time.js");
(0, vitest_1.test)('convertDurationStringToUs', () => {
    (0, vitest_1.expect)((0, timeUtils_js_1.convertDurationStringToUs)('2y 318d 6h 16m 19s 200ms 0us')).toEqual(90577779200000);
    (0, vitest_1.expect)((0, timeUtils_js_1.convertDurationStringToUs)('100ms -1000us')).toEqual(99000);
    (0, vitest_1.expect)((0, timeUtils_js_1.convertDurationStringToUs)('200ms 0us')).toEqual(200000);
    (0, vitest_1.expect)((0, timeUtils_js_1.convertDurationStringToUs)('30s')).toEqual(3e7);
    (0, vitest_1.expect)((0, timeUtils_js_1.convertDurationStringToUs)('300')).toEqual(300);
    (0, vitest_1.expect)(() => (0, timeUtils_js_1.convertDurationStringToUs)('30f')).toThrowError(`Invalid time format: Must be of format:
    1y 3d 2h 24m 35s 18ms 70us,
    [+/-]DOYThh:mm:ss[.sss],
    duration
    `);
});
(0, vitest_1.test)('convertUTCToMs', () => {
    var _a;
    // standard date conversion
    (0, vitest_1.expect)((0, timeUtils_js_1.pgUTCToMs)('2024-01-01T00:00:00Z')).toEqual(1704067200000);
    // DOY doesn't work
    (0, vitest_1.expect)((0, timeUtils_js_1.pgUTCToMs)('2024-001T00:00:00Z')).toEqual(NaN);
    // conversion to DOY is fine if the time zone ("Z") is excluded
    (0, vitest_1.expect)((0, timeUtils_js_1.pgUTCToMs)((_a = (0, timeUtils_js_1.convertDoyToYmd)('2024-001T00:00:00')) !== null && _a !== void 0 ? _a : '')).toEqual(1704067200000);
    // conversion without a timezone in the input - this is compared to a new Date object in order to use the test runner's machine's timezone (as the result of convertUTCToMs should follow *that* timezone)
    (0, vitest_1.expect)((0, timeUtils_js_1.pgUTCToMs)('2024-01-01 00:00:00')).toEqual(new Date('2024-01-01 00:00:00').getTime());
    // any other string fails
    (0, vitest_1.expect)((0, timeUtils_js_1.pgUTCToMs)('not a date')).toEqual(NaN);
});
(0, vitest_1.test)('convertDurationStringToInterval', () => {
    (0, vitest_1.expect)((0, timeUtils_js_1.convertDurationStringToPGInterval)('2y 318d 6h 16m 19s 200ms 0us')).toEqual('2 years 318 days 6 hours 16 minutes 19 seconds 200 milliseconds');
    (0, vitest_1.expect)((0, timeUtils_js_1.convertDurationStringToPGInterval)('1d 5h 23m 0s 300ms')).toEqual('1 day 5 hours 23 minutes 300 milliseconds');
    (0, vitest_1.expect)((0, timeUtils_js_1.convertDurationStringToPGInterval)('1d -5h')).toEqual('19 hours');
    (0, vitest_1.expect)((0, timeUtils_js_1.convertDurationStringToPGInterval)('- 5h 23m 0s 300ms')).toEqual('-5 hours -23 minutes -300 milliseconds');
    (0, vitest_1.expect)(() => (0, timeUtils_js_1.convertDurationStringToUs)('30f')).toThrowError(`Invalid time format: Must be of format:
    1y 3d 2h 24m 35s 18ms 70us,
    [+/-]DOYThh:mm:ss[.sss],
    duration
    `);
});
(0, vitest_1.test)('convertUsToDurationString', () => {
    (0, vitest_1.expect)((0, timeUtils_js_1.convertUsToDurationString)(90577779200000)).toEqual('2y 318d 6h 16m 19s 200ms');
    (0, vitest_1.expect)((0, timeUtils_js_1.convertUsToDurationString)(200000)).toEqual('200ms');
    (0, vitest_1.expect)((0, timeUtils_js_1.convertUsToDurationString)(3e7)).toEqual('30s');
    (0, vitest_1.expect)((0, timeUtils_js_1.convertUsToDurationString)(-8.64e10)).toEqual('- 1d');
});
(0, vitest_1.test)('convertDoyToYmd', () => {
    (0, vitest_1.expect)((0, timeUtils_js_1.convertDoyToYmd)('2023-001T00:10:12', false)).toEqual('2023-01-01T00:10:12Z');
    (0, vitest_1.expect)((0, timeUtils_js_1.convertDoyToYmd)('2023-001T00:00:00', false)).toEqual('2023-01-01T00:00:00Z');
    (0, vitest_1.expect)((0, timeUtils_js_1.convertDoyToYmd)('2023-032T00:00:00', false)).toEqual('2023-02-01T00:00:00Z');
    (0, vitest_1.expect)((0, timeUtils_js_1.convertDoyToYmd)('2023-048T10:32:44.123', true)).toEqual('2023-02-17T10:32:44.123Z');
    (0, vitest_1.expect)((0, timeUtils_js_1.convertDoyToYmd)('2023-04-10T10:32:44.123', true)).toEqual('2023-04-10T10:32:44.123Z');
});
(0, vitest_1.test)('getDaysInMonth', () => {
    (0, vitest_1.expect)((0, timeUtils_js_1.getDaysInMonth)(2022, 0)).toEqual(31);
    (0, vitest_1.expect)((0, timeUtils_js_1.getDaysInMonth)(2022, 1)).toEqual(28);
    (0, vitest_1.expect)((0, timeUtils_js_1.getDaysInMonth)(2024, 0)).toEqual(31);
    (0, vitest_1.expect)((0, timeUtils_js_1.getDaysInMonth)(2024, 1)).toEqual(29);
});
(0, vitest_1.test)('getDaysInYear', () => {
    (0, vitest_1.expect)((0, timeUtils_js_1.getDaysInYear)(2020)).toEqual(366);
    (0, vitest_1.expect)((0, timeUtils_js_1.getDaysInYear)(2021)).toEqual(365);
    (0, vitest_1.expect)((0, timeUtils_js_1.getDaysInYear)(2022)).toEqual(365);
    (0, vitest_1.expect)((0, timeUtils_js_1.getDaysInYear)(2023)).toEqual(365);
    (0, vitest_1.expect)((0, timeUtils_js_1.getDaysInYear)(2024)).toEqual(366);
    (0, vitest_1.expect)((0, timeUtils_js_1.getDaysInYear)(2025)).toEqual(365);
});
(0, vitest_1.test)('getDoy', () => {
    const doy = (0, timeUtils_js_1.getDoy)(new Date('1/3/2019'));
    (0, vitest_1.expect)(doy).toEqual(3);
});
(0, vitest_1.test)('getDoyTimeComponents', () => {
    const doyTimeComponents = (0, timeUtils_js_1.getDoyTimeComponents)(new Date(1683148238813));
    (0, vitest_1.expect)(doyTimeComponents).deep.equal({
        doy: '123',
        hours: '21',
        mins: '10',
        msecs: '813',
        secs: '38',
        year: '2023',
    });
});
(0, vitest_1.test)('getDoyTime', () => {
    const doyTime = (0, timeUtils_js_1.getDoyTime)(new Date(1577779200000));
    (0, vitest_1.expect)(doyTime).toEqual('2019-365T08:00:00');
});
(0, vitest_1.test)('getUnixEpochTime', () => {
    const unixEpochTime = (0, timeUtils_js_1.getUnixEpochTime)('2019-365T08:00:00.000');
    (0, vitest_1.expect)(unixEpochTime).toEqual(1577779200000);
});
(0, vitest_1.test)('parseDoyOrYmdTime', () => {
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDoyOrYmdTime)('2019-365T08:00:00.1234')).toEqual({
        doy: 365,
        hour: 8,
        min: 0,
        ms: 123.4,
        sec: 0,
        time: '08:00:00.1234',
        year: 2019,
    });
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDoyOrYmdTime)('2019-01-20T08:10:03.9')).toEqual({
        day: 20,
        hour: 8,
        min: 10,
        month: 1,
        ms: 900,
        sec: 3,
        time: '08:10:03.9',
        year: 2019,
    });
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDoyOrYmdTime)('2022-01-2T00:00:00')).toEqual({
        day: 2,
        hour: 0,
        min: 0,
        month: 1,
        ms: 0,
        sec: 0,
        time: '00:00:00',
        year: 2022,
    });
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDoyOrYmdTime)('2022-10-2T00:00:00')).toEqual({
        day: 2,
        hour: 0,
        min: 0,
        month: 10,
        ms: 0,
        sec: 0,
        time: '00:00:00',
        year: 2022,
    });
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDoyOrYmdTime)('012T03:01:30.920')).toEqual({
        days: 12,
        hours: 3,
        isNegative: false,
        microseconds: 0,
        milliseconds: 920,
        minutes: 1,
        seconds: 30,
        years: 0,
    });
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDoyOrYmdTime)('-112T13:41:00')).toEqual({
        days: 112,
        hours: 13,
        isNegative: true,
        microseconds: 0,
        milliseconds: 0,
        minutes: 41,
        seconds: 0,
        years: 0,
    });
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDoyOrYmdTime)('2019-365T08:80:00.1234')).toEqual(null);
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDoyOrYmdTime)('2022-20-2T00:00:00')).toEqual(null);
});
(0, vitest_1.test)('getTimeAgo', () => {
    const time = new Date('2023-05-23T00:00:00.000Z');
    (0, vitest_1.expect)((0, timeUtils_js_1.getTimeAgo)(new Date())).toEqual('Now');
    (0, vitest_1.expect)((0, timeUtils_js_1.getTimeAgo)(new Date(time.getTime() - 100), time)).toEqual('Now');
    (0, vitest_1.expect)((0, timeUtils_js_1.getTimeAgo)(new Date(time.getTime() - 1000), time)).toEqual('1s ago');
    (0, vitest_1.expect)((0, timeUtils_js_1.getTimeAgo)(new Date(time.getTime() - 1000 * 60), time)).toEqual('1m ago');
    (0, vitest_1.expect)((0, timeUtils_js_1.getTimeAgo)(new Date(time.getTime() - 1000 * 60 * 60), time)).toEqual('1h ago');
    (0, vitest_1.expect)((0, timeUtils_js_1.getTimeAgo)(new Date(time.getTime() - 1000 * 60 * 60 * 23), time)).toEqual('23h ago');
    (0, vitest_1.expect)((0, timeUtils_js_1.getTimeAgo)(new Date(time.getTime() - 1000 * 60 * 60 * 24), time)).toEqual('2023-05-22');
    (0, vitest_1.expect)((0, timeUtils_js_1.getTimeAgo)(new Date(time.getTime() - 1000 * 60 * 60 * 24), time, 1000 * 60 * 60 * 24)).toEqual('1d ago');
    (0, vitest_1.expect)((0, timeUtils_js_1.getTimeAgo)(new Date(time.getTime() - 1000 * 60 * 60 * 24 * 366), time, 1000 * 60 * 60 * 24 * 366)).toEqual('1y ago');
});
(0, vitest_1.test)('getShortISOForDate', () => {
    (0, vitest_1.expect)((0, timeUtils_js_1.getShortISOForDate)(new Date('2023-05-23T00:00:00.000Z'))).toEqual('2023-05-23T00:00:00');
});
(0, vitest_1.test)('parseDurationString', () => {
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDurationString)('1h 30m 45s')).toEqual({
        days: 0,
        hours: 1,
        isNegative: false,
        microseconds: 0,
        milliseconds: 0,
        minutes: 30,
        seconds: 45,
        years: 0,
    });
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDurationString)('-2d 12h 30m 15.5s 250ms')).toEqual({
        days: 2,
        hours: 12,
        isNegative: true,
        microseconds: 0,
        milliseconds: 250,
        minutes: 30,
        seconds: 15.5,
        years: 0,
    });
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDurationString)('500us')).toEqual({
        days: 0,
        hours: 0,
        isNegative: false,
        microseconds: 500,
        milliseconds: 0,
        minutes: 0,
        seconds: 0,
        years: 0,
    });
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDurationString)('1000')).toEqual({
        days: 0,
        hours: 0,
        isNegative: false,
        microseconds: 1000,
        milliseconds: 0,
        minutes: 0,
        seconds: 0,
        years: 0,
    });
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDurationString)('-1000', 'seconds')).toEqual({
        days: 0,
        hours: 0,
        isNegative: true,
        microseconds: 0,
        milliseconds: 0,
        minutes: 16,
        seconds: 40,
        years: 0,
    });
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDurationString)('+100000000000')).toEqual({
        days: 0,
        hours: 0,
        isNegative: false,
        microseconds: 0,
        milliseconds: 0,
        minutes: 1,
        seconds: 40,
        years: 0,
    });
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDurationString)('-366', 'days')).toEqual({
        days: 1,
        hours: 0,
        isNegative: true,
        microseconds: 0,
        milliseconds: 0,
        minutes: 0,
        seconds: 0,
        years: 1,
    });
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDurationString)('1.1', 'days')).toEqual({
        days: 1,
        hours: 0.1,
        isNegative: false,
        microseconds: 0,
        milliseconds: 0,
        minutes: 0,
        seconds: 0,
        years: 0,
    });
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDurationString)('1.01', 'minutes')).toEqual({
        days: 0,
        hours: 0,
        isNegative: false,
        microseconds: 0,
        milliseconds: 0,
        minutes: 1,
        seconds: 0.01,
        years: 0,
    });
    (0, vitest_1.expect)((0, timeUtils_js_1.parseDurationString)('24:00:00')).toEqual({
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
(0, vitest_1.test)('getDurationTimeComponents', () => {
    (0, vitest_1.expect)((0, timeUtils_js_1.getDurationTimeComponents)({
        days: 3,
        hours: 10,
        isNegative: false,
        microseconds: 0,
        milliseconds: 0,
        minutes: 30,
        seconds: 45,
        years: 2,
    })).toEqual({
        days: '003',
        hours: '10',
        isNegative: '',
        microseconds: '',
        milliseconds: '',
        minutes: '30',
        seconds: '45',
        years: '0002',
    });
    (0, vitest_1.expect)((0, timeUtils_js_1.getDurationTimeComponents)({
        days: 300,
        hours: 2,
        isNegative: true,
        microseconds: 1,
        milliseconds: 123,
        minutes: 1,
        seconds: 2,
        years: 0,
    })).toEqual({
        days: '300',
        hours: '02',
        isNegative: '-',
        microseconds: '001',
        milliseconds: '123',
        minutes: '01',
        seconds: '02',
        years: '0000',
    });
    (0, vitest_1.expect)((0, timeUtils_js_1.getDurationTimeComponents)({
        days: 0,
        hours: 0,
        isNegative: false,
        microseconds: 123,
        milliseconds: 0,
        minutes: 0,
        seconds: 2,
        years: 0,
    })).toEqual({
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
(0, vitest_1.test)('isTimeBalanced', () => {
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeBalanced)('2024-001T00:00:00', time_js_1.TimeTypes.ABSOLUTE)).toBe(true);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeBalanced)('2024-001T12:90:00', time_js_1.TimeTypes.ABSOLUTE)).toBe(false);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeBalanced)('9999-365T23:59:60.999', time_js_1.TimeTypes.ABSOLUTE)).toBe(false);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeBalanced)('2024-365T23:59:60', time_js_1.TimeTypes.ABSOLUTE)).toBe(false);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeBalanced)('2023-363T23:19:30', time_js_1.TimeTypes.ABSOLUTE)).toBe(true);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeBalanced)('0000-000T00:00:00', time_js_1.TimeTypes.ABSOLUTE)).toBe(false);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeBalanced)('0000-000T24:60:60', time_js_1.TimeTypes.ABSOLUTE)).toBe(false);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeBalanced)('001T12:43:20.000', time_js_1.TimeTypes.RELATIVE)).toBe(true);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeBalanced)('09:04:00.340', time_js_1.TimeTypes.RELATIVE)).toBe(true);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeBalanced)('001T23:59:60.000', time_js_1.TimeTypes.RELATIVE)).toBe(false);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeBalanced)('365T23:59:60.000', time_js_1.TimeTypes.RELATIVE)).toBe(false);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeBalanced)('24:60:60', time_js_1.TimeTypes.RELATIVE)).toBe(false);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeBalanced)('+001T12:43:20.000', time_js_1.TimeTypes.EPOCH)).toBe(true);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeBalanced)('-09:04:00.340', time_js_1.TimeTypes.EPOCH)).toBe(true);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeBalanced)('-001T23:59:60.000', time_js_1.TimeTypes.EPOCH)).toBe(false);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeBalanced)('-365T23:59:60.000', time_js_1.TimeTypes.EPOCH)).toBe(false);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeBalanced)('365T22:59:60.000', time_js_1.TimeTypes.EPOCH)).toBe(false);
});
(0, vitest_1.test)('getBalancedDuration', () => {
    (0, vitest_1.expect)((0, timeUtils_js_1.getBalancedDuration)('001T23:59:60.1')).toBe('002T00:00:00.100');
    (0, vitest_1.expect)((0, timeUtils_js_1.getBalancedDuration)('24:60:60')).toBe('001T01:01:00.000');
    (0, vitest_1.expect)((0, timeUtils_js_1.getBalancedDuration)('1')).toBe('00:00:01.000');
    (0, vitest_1.expect)((0, timeUtils_js_1.getBalancedDuration)('45600')).toBe('12:40:00.000');
    (0, vitest_1.expect)((0, timeUtils_js_1.getBalancedDuration)('-001T00:59:10.000')).toBe('-001T00:59:10.000');
    (0, vitest_1.expect)((0, timeUtils_js_1.getBalancedDuration)('-365T22:59:60.999')).toBe('-365T23:00:00.999');
    (0, vitest_1.expect)((0, timeUtils_js_1.getBalancedDuration)('-1')).toBe('-00:00:01.000');
    (0, vitest_1.expect)((0, timeUtils_js_1.getBalancedDuration)('+190')).toBe('00:03:10.000');
});
(0, vitest_1.test)('isTimeMax', () => {
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeMax)('9999-365T23:59:60.999', time_js_1.TimeTypes.ABSOLUTE)).toBe(true);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeMax)('365T23:59:60.999', time_js_1.TimeTypes.RELATIVE)).toBe(true);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeMax)('365T23:59:60.000', time_js_1.TimeTypes.RELATIVE)).toBe(true);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeMax)('-365T23:59:60.999', time_js_1.TimeTypes.EPOCH)).toBe(true);
    (0, vitest_1.expect)((0, timeUtils_js_1.isTimeMax)('365T22:59:60.999', time_js_1.TimeTypes.EPOCH)).toBe(false);
});
(0, vitest_1.test)('validateTime', () => {
    (0, vitest_1.expect)((0, timeUtils_js_1.validateTime)('2024-001T00:00:00', time_js_1.TimeTypes.ABSOLUTE)).toBe(true);
    (0, vitest_1.expect)((0, timeUtils_js_1.validateTime)('2024-001T', time_js_1.TimeTypes.ABSOLUTE)).toBe(false);
    (0, vitest_1.expect)((0, timeUtils_js_1.validateTime)('12:90:00', time_js_1.TimeTypes.ABSOLUTE)).toBe(false);
    (0, vitest_1.expect)((0, timeUtils_js_1.validateTime)('-001T23:59:60.000', time_js_1.TimeTypes.RELATIVE)).toBe(false);
    (0, vitest_1.expect)((0, timeUtils_js_1.validateTime)('365T23:59:60.000', time_js_1.TimeTypes.RELATIVE)).toBe(true);
    (0, vitest_1.expect)((0, timeUtils_js_1.validateTime)('-03:59:60.000', time_js_1.TimeTypes.RELATIVE)).toBe(false);
    (0, vitest_1.expect)((0, timeUtils_js_1.validateTime)('+03:59:60.000', time_js_1.TimeTypes.RELATIVE)).toBe(false);
    (0, vitest_1.expect)((0, timeUtils_js_1.validateTime)('03:59:60.190', time_js_1.TimeTypes.RELATIVE)).toBe(true);
    (0, vitest_1.expect)((0, timeUtils_js_1.validateTime)('2023-365T23:59:60', time_js_1.TimeTypes.EPOCH)).toBe(false);
    (0, vitest_1.expect)((0, timeUtils_js_1.validateTime)('2023-365T23:59:60', time_js_1.TimeTypes.EPOCH)).toBe(false);
    (0, vitest_1.expect)((0, timeUtils_js_1.validateTime)('-001T23:59:60.000', time_js_1.TimeTypes.EPOCH)).toBe(true);
    (0, vitest_1.expect)((0, timeUtils_js_1.validateTime)('365T23:59:60.000', time_js_1.TimeTypes.EPOCH)).toBe(true);
    (0, vitest_1.expect)((0, timeUtils_js_1.validateTime)('+03:59:60.000', time_js_1.TimeTypes.EPOCH)).toBe(true);
    (0, vitest_1.expect)((0, timeUtils_js_1.validateTime)('3:59:60', time_js_1.TimeTypes.EPOCH)).toBe(false);
});
(0, vitest_1.test)('removeDateStringMilliseconds', () => {
    (0, vitest_1.expect)((0, timeUtils_js_1.removeDateStringMilliseconds)('2024-001T00:00:00.593')).toBe('2024-001T00:00:00');
    (0, vitest_1.expect)((0, timeUtils_js_1.removeDateStringMilliseconds)('123456.593')).toBe('123456.593');
});
//# sourceMappingURL=timeUtils.test.js.map