import { ChainId } from '@aave/contract-helpers';
import { AaveV3Arbitrum } from '@aave-dao/aave-address-book';
import { CustomMarket } from 'src/ui-config/marketsConfig';

import { SwapType } from '../../types';
import { COW_PARTNER_FEE } from '../cow.constants';

jest.mock('src/utils/marketsAndNetworksConfig', () => {
  const { AaveV3Arbitrum, AaveV3Polygon } = jest.requireActual('@aave-dao/aave-address-book');
  return {
    marketsData: {
      proto_polygon_v3: {
        chainId: 137,
        v3: true,
        addresses: { COLLECTOR: AaveV3Polygon.COLLECTOR },
      },
      proto_arbitrum_v3: {
        chainId: 42161,
        v3: true,
        addresses: { COLLECTOR: AaveV3Arbitrum.COLLECTOR },
      },
    },
  };
});

it("pays the partner fee to the order chain's collector when the selected market is on another chain", () => {
  const fee = COW_PARTNER_FEE(
    'USDC',
    'AAVE',
    SwapType.Swap,
    CustomMarket.proto_polygon_v3,
    ChainId.arbitrum_one
  );

  expect(fee.recipient).toBe(AaveV3Arbitrum.COLLECTOR);
});
