"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EPOCH_SIMPLE = exports.EPOCH_TIME = exports.RELATIVE_SIMPLE = exports.RELATIVE_TIME = exports.ABSOLUTE_TIME = void 0;
exports.ABSOLUTE_TIME = /^(\d{4})-(\d{3})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?$/;
exports.RELATIVE_TIME = /^(?<doy>([0-9]{3}))?(T)?(?<hr>([0-9]{2})):(?<mins>([0-9]{2})):(?<secs>[0-9]{2})?(\.)?(?<ms>([0-9]+))?$/;
exports.RELATIVE_SIMPLE = /(\d+)(\.[0-9]+)?$/;
exports.EPOCH_TIME = /^((?<sign>[+-]?))(?<doy>([0-9]{3}))?(T)?(?<hr>([0-9]{2})):(?<mins>([0-9]{2})):(?<secs>[0-9]{2})?(\.)?(?<ms>([0-9]+))?$/;
exports.EPOCH_SIMPLE = /(^[+-]?)(\d+)(\.[0-9]+)?$/;
