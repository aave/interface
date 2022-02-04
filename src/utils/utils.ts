import { FormatUserSummaryAndIncentivesResponse, valueToBigNumber } from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

export function hexToAscii(_hex: string): string {
  const hex = _hex.toString();
  let str = '';
  for (let n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
}
