import { mintAmountsPerToken, valueToWei } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';

export const getNormalizedMintAmount = (reserveSymbol: string, reserveDecimals: number) => {
  const defaultValue = valueToWei('1000', 18);
  const mintAmount = mintAmountsPerToken[reserveSymbol.toUpperCase()]
    ? mintAmountsPerToken[reserveSymbol.toUpperCase()]
    : defaultValue;
  return normalize(mintAmount, reserveDecimals);
};
