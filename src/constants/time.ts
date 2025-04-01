export const ABSOLUTE_TIME = /^(\d{4})-(\d{3})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?$/;
export const RELATIVE_TIME =/^(?<doy>([0-9]{3}))?(T)?(?<hr>([0-9]{2})):(?<mins>([0-9]{2})):(?<secs>[0-9]{2})?(\.)?(?<ms>([0-9]+))?$/;
export const RELATIVE_SIMPLE = /(\d+)(\.[0-9]+)?$/;
export const EPOCH_TIME =/^((?<sign>[+-]?))(?<doy>([0-9]{3}))?(T)?(?<hr>([0-9]{2})):(?<mins>([0-9]{2})):(?<secs>[0-9]{2})?(\.)?(?<ms>([0-9]+))?$/;
export const EPOCH_SIMPLE = /(^[+-]?)(\d+)(\.[0-9]+)?$/;
