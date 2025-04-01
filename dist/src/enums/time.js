"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeTypes = exports.TIME_MS = void 0;
var TIME_MS;
(function (TIME_MS) {
    TIME_MS[TIME_MS["MILLISECOND"] = 1] = "MILLISECOND";
    TIME_MS[TIME_MS["SECOND"] = 1000] = "SECOND";
    TIME_MS[TIME_MS["MINUTE"] = 60000] = "MINUTE";
    TIME_MS[TIME_MS["HOUR"] = 3600000] = "HOUR";
    TIME_MS[TIME_MS["DAY"] = 86400000] = "DAY";
    TIME_MS[TIME_MS["MONTH"] = 2629800000] = "MONTH";
    TIME_MS[TIME_MS["YEAR"] = 31557600000] = "YEAR";
})(TIME_MS || (exports.TIME_MS = TIME_MS = {}));
var TimeTypes;
(function (TimeTypes) {
    TimeTypes["ABSOLUTE"] = "absolute";
    TimeTypes["EPOCH"] = "epoch";
    TimeTypes["EPOCH_SIMPLE"] = "epoch_simple";
    TimeTypes["RELATIVE"] = "relative";
    TimeTypes["RELATIVE_SIMPLE"] = "relative_simple";
})(TimeTypes || (exports.TimeTypes = TimeTypes = {}));
