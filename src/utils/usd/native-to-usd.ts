import { BigNumberValue, valueToBigNumber } from '@aave/math-utils';
import BigNumber from 'bignumber.js';

interface NativeToUSD {
  amount: BigNumber;
  currencyDecimals: number;
  priceInMarketReferenceCurrency: BigNumberValue;
  marketReferenceCurrencyDecimals: number;
  normalizedMarketReferencePriceInUsd: BigNumberValue;
}

export function nativeToUSD({
  amount,
  currencyDecimals,
  priceInMarketReferenceCurrency,
  marketReferenceCurrencyDecimals,
  normalizedMarketReferencePriceInUsd,
}: NativeToUSD) {
  return valueToBigNumber(amount.toString())
    .multipliedBy(priceInMarketReferenceCurrency)
    .multipliedBy(normalizedMarketReferencePriceInUsd)
    .dividedBy(new BigNumber(1).shiftedBy(currencyDecimals + marketReferenceCurrencyDecimals))
    .toString();
}
