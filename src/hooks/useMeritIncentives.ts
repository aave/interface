import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { Side } from 'src/utils/utils';

export enum MeritAction {
  ETHEREUM_STKGHO = 'ethereum-stkgho',
  SUPPLY_CBBTC_BORROW_USDC = 'supply-cbtc-borrow-usdc',
}

type MeritIncentives = {
  totalAPR: number;
  actionsAPR: {
    [key in MeritAction]: number;
  };
};

const url = 'https://apps.aavechan.com/api/merit/aprs';

export type MeritReserveIncentiveData = Omit<ReserveIncentiveResponse, 'incentiveAPR'> & {
  action: MeritAction;
  side?: Side;
};

const symbolToMeritData = (
  symbol: string,
  market: string
): MeritReserveIncentiveData | undefined => {
  switch (market) {
    case CustomMarket.proto_mainnet_v3:
      switch (symbol) {
        case 'GHO':
          return {
            action: MeritAction.ETHEREUM_STKGHO,
            rewardTokenAddress: AaveV3Ethereum.ASSETS.GHO.UNDERLYING,
            rewardTokenSymbol: 'GHO',
          };
        case 'cbBTC':
          return {
            action: MeritAction.SUPPLY_CBBTC_BORROW_USDC,
            rewardTokenAddress: AaveV3Ethereum.ASSETS.USDC.A_TOKEN,
            rewardTokenSymbol: 'aEthUSDC',
            side: Side.SUPPLY,
          };
        case 'USDC':
          return {
            action: MeritAction.SUPPLY_CBBTC_BORROW_USDC,
            rewardTokenAddress: AaveV3Ethereum.ASSETS.USDC.A_TOKEN,
            rewardTokenSymbol: 'aEthUSDC',
            side: Side.BORROW,
          };
        default:
          return undefined;
      }
    default:
      return undefined;
  }
};

export const useMeritIncentives = ({
  symbol,
  market,
  side,
}: {
  symbol: string;
  market: string;
  side?: Side;
}) => {
  const user = useRootStore((store) => store.account);

  return useQuery({
    queryFn: async () => {
      let meritIncentives: MeritIncentives | null = null;

      if (user) {
        // const response = await fetch(`${url}?user=${user}`);
        // const data = await response.json();
        // meritIncentives = data.currentAPR as MeritIncentives;
        let mockedAprs;
        if (user == '0xf8E0D20E5548f3b607547ACec4149Ef9d951Df73'.toLowerCase()) {
          mockedAprs = {
            totalAPR: 8,
            actionsAPR: {
              // ...aprs.actionsAPR,
              'supply-cbtc-borrow-usdc': 10,
            },
          } as MeritIncentives;
        } else {
          mockedAprs = {
            totalAPR: 8,
            actionsAPR: {
              // ...aprs.actionsAPR,
              'supply-cbtc-borrow-usdc': 5,
            },
          } as MeritIncentives;
        }
        meritIncentives = mockedAprs;
      }

      if (!meritIncentives) {
        const response = await fetch(url);
        const data = await response.json();
        meritIncentives = data.currentAPR as MeritIncentives;
        const mockedAprs = {
          totalAPR: meritIncentives.totalAPR,
          actionsAPR: {
            ...meritIncentives.actionsAPR,
            'supply-cbtc-borrow-usdc': 8,
          },
        } as MeritIncentives;
        meritIncentives = mockedAprs;
      }

      return meritIncentives;
    },
    queryKey: ['meritIncentives'],
    staleTime: 1000 * 60 * 5,
    select: (data) => {
      const meritReserveIncentiveData = symbolToMeritData(symbol, market);
      if (!meritReserveIncentiveData) {
        return null;
      }
      if (meritReserveIncentiveData.side !== side) {
        return null;
      }

      const APR = data.actionsAPR[meritReserveIncentiveData.action];
      return {
        incentiveAPR: (APR / 100).toString(),
        rewardTokenAddress: meritReserveIncentiveData.rewardTokenAddress,
        rewardTokenSymbol: meritReserveIncentiveData.rewardTokenSymbol,
      } as ReserveIncentiveResponse;
    },
  });
};
