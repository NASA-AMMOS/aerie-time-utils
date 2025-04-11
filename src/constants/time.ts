export const ISO_ORDINAL_TIME_REGEX =
  /^(?<year>(\d{4}))-(?<doy>(\d{3}))T(?<hr>(\d{2})):(?<mins>(\d{2})):(?<secs>(\d{2}))(?:\.(?<ms>\d+))?$/;
export const ISO_8601_UTC_REGEX =
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hr>\d{2}):(?<mins>\d{2}):(?<secs>\d{2})(?:\.(?<ms>\d+))?Z$/;
export const DOY_TIME_REGEX =
  /^((?<sign>[+-]?))(?<doy>(\d{3}))?(T)?(?<hr>(\d{2})):(?<mins>(\d{2})):(?<secs>\d{2})(?:\.(?<ms>\d+))?$/;
export const SECOND_TIME_REGEX =
  /^(?<sign>([+-]?))(?<secs>(\d+))(?:\.(?<ms>\d+))?$/;

export const MAX_UTC_YEAR = 9999;
export const MAX_DOY = 365;
