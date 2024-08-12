import _ from 'lodash';

export const calculateAPYTon = (currentLiquidityRate: string) => {
  const value = (1 + Number(currentLiquidityRate) / 31536000) ** 31536000 - 1;
  return value;
};

export const calculateTotalElementTon = <T>(data: T[], key: keyof T): number => {
  return _.sumBy(data, (item) => {
    const value = item[key];
    const numericValue = typeof value === 'string' ? parseFloat(value) : (value as number);
    return isNaN(numericValue) ? 0 : numericValue;
  });
};
