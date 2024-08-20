import { BigNumberValue } from '@aave/math-utils';
import BigNumber from 'bignumber.js';

export function normalizedToUsd(
  value: BigNumber,
  marketReferencePriceInUsd: BigNumberValue,
  marketReferenceCurrencyDecimals: number
): BigNumber {
  return value
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(marketReferenceCurrencyDecimals * -1);
}
