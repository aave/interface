import type { CustomMarket } from 'src/ui-config/marketsConfig';

import { SwapType } from '../../types';
import { COW_PARTNER_FEE } from '../cow.constants';

jest.mock('src/utils/marketsAndNetworksConfig', () => ({ marketsData: {} }));

const market = 'proto_mainnet_v3' as CustomMarket;
const bps = (from: string, to: string, swapType: SwapType) =>
  COW_PARTNER_FEE(from, to, swapType, market).volumeBps;

describe('COW_PARTNER_FEE', () => {
  it.each([
    [SwapType.Swap, 15, 25, 15],
    [SwapType.CollateralSwap, 15, 25, 15],
    [SwapType.WithdrawAndSwap, 15, 25, 15],
    [SwapType.DebtSwap, 0, 0, 0],
    [SwapType.RepayWithCollateral, 2, 25, 25],
  ])(
    '%s charges %i bps correlated, %i bps cross group and %i bps for an unknown pair',
    (swapType, correlated, different, unknownPair) => {
      expect(bps('USDC', 'aDAI', swapType)).toBe(correlated);
      expect(bps('WETH', 'USDC', swapType)).toBe(different);
      expect(bps('LINK', 'AAVE', swapType)).toBe(unknownPair);
    }
  );
});
