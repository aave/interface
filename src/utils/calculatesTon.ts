import _ from 'lodash';

export const calculateAPYTon = (currentLiquidityRate: string) => {
  const value = (1 + Number(currentLiquidityRate) / 31536000) ** 31536000 - 1;
  return value;
};

export const calculateTotalElementTon = <T>(
  data: T[],
  valueKey: keyof T,
  collateralKey?: keyof T // Tham số này giờ là tùy chọn
): number => {
  return _.sumBy(data, (item) => {
    if (collateralKey && item[collateralKey] === false) {
      return 0;
    }
    const value = item[valueKey];
    const numericValue = typeof value === 'string' ? parseFloat(value) : (value as number);
    return isNaN(numericValue) ? 0 : numericValue;
  });
};
