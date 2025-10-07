const ONE_MINUTE_IN_SECONDS = 60;
const ONE_HOUR_IN_SECONDS = 3600;
const ONE_DAY_IN_SECONDS = 86400;
const ONE_MONTH_IN_SECONDS = 2592000;

export const Expiry: { [key: string]: number } = {
  'Five minutes': ONE_MINUTE_IN_SECONDS * 5,
  'Half hour': ONE_HOUR_IN_SECONDS / 2,
  'One hour': ONE_HOUR_IN_SECONDS,
  'One day': ONE_DAY_IN_SECONDS,
  'One week': 7 * ONE_DAY_IN_SECONDS,
  'One month': ONE_MONTH_IN_SECONDS,
  'Three months': 3 * ONE_MONTH_IN_SECONDS,
  'One year': 12 * ONE_MONTH_IN_SECONDS,
};
