const ONE_MINUTE_IN_SECONDS = 60;
const ONE_HOUR_IN_SECONDS = 3600;
const ONE_DAY_IN_SECONDS = 86400;
const ONE_MONTH_IN_SECONDS = 2592000;

export enum Expiry {
  TEN_MINUTES = '10 minutes',
  HALF_HOUR = 'Half hour',
  ONE_HOUR = 'One hour',
  ONE_DAY = 'One day',
  ONE_WEEK = 'One week',
  ONE_MONTH = 'One month',
  THREE_MONTHS = 'Three months',
  ONE_YEAR = 'One year',
}

export const ExpiryToSecondsMap = {
  [Expiry.TEN_MINUTES]: ONE_MINUTE_IN_SECONDS * 10,
  [Expiry.HALF_HOUR]: ONE_HOUR_IN_SECONDS / 2,
  [Expiry.ONE_HOUR]: ONE_HOUR_IN_SECONDS,
  [Expiry.ONE_DAY]: ONE_DAY_IN_SECONDS,
  [Expiry.ONE_WEEK]: 7 * ONE_DAY_IN_SECONDS,
  [Expiry.ONE_MONTH]: ONE_MONTH_IN_SECONDS,
  [Expiry.THREE_MONTHS]: 3 * ONE_MONTH_IN_SECONDS,
  [Expiry.ONE_YEAR]: 12 * ONE_MONTH_IN_SECONDS,
};
