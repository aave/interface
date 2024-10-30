import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { useQuery } from '@tanstack/react-query';
import { CustomMarket } from 'src/ui-config/marketsConfig';

export enum MeritAction {
  ETHEREUM_STKGHO = 'ethereum-stkgho',
  SUPPLY_CBBTC_BORROW_USDC = 'ethereum-supply-cbbtc-borrow-usdc',
  SUPPLY_WBTC_BORROW_USDT = 'ethereum-supply-wbtc-borrow-usdt',
}

type MeritIncentives = {
  totalAPR: number;
  actionsAPR: {
    [key in MeritAction]: number;
  };
};

export type ExtendedReserveIncentiveResponse = ReserveIncentiveResponse & {
  customMessage: string;
};

const url = 'https://apps.aavechan.com/api/merit/aprs';

export type MeritReserveIncentiveData = Omit<ReserveIncentiveResponse, 'incentiveAPR'> & {
  action: MeritAction;
  protocolAction?: ProtocolAction;
  customMessage?: string;
};

const getMeritData = (market: string, symbol: string): MeritReserveIncentiveData | undefined =>
  MERIT_DATA_MAP[market]?.[symbol];

const MERIT_DATA_MAP: Record<string, Record<string, MeritReserveIncentiveData>> = {
  [CustomMarket.proto_mainnet_v3]: {
    GHO: {
      action: MeritAction.ETHEREUM_STKGHO,
      rewardTokenAddress: AaveV3Ethereum.ASSETS.GHO.UNDERLYING,
      rewardTokenSymbol: 'GHO',
    },
    cbBTC: {
      action: MeritAction.SUPPLY_CBBTC_BORROW_USDC,
      rewardTokenAddress: AaveV3Ethereum.ASSETS.USDC.A_TOKEN,
      rewardTokenSymbol: 'aEthUSDC',
      protocolAction: ProtocolAction.supply,
      customMessage: 'You must supply cbBTC and borrow USDC in order to receive merit rewards.',
    },
    USDC: {
      action: MeritAction.SUPPLY_CBBTC_BORROW_USDC,
      rewardTokenAddress: AaveV3Ethereum.ASSETS.USDC.A_TOKEN,
      rewardTokenSymbol: 'aEthUSDC',
      protocolAction: ProtocolAction.borrow,
      customMessage: 'You must supply cbBTC and borrow USDC in order to receive merit rewards.',
    },
    WBTC: {
      action: MeritAction.SUPPLY_WBTC_BORROW_USDT,
      rewardTokenAddress: AaveV3Ethereum.ASSETS.USDT.A_TOKEN,
      rewardTokenSymbol: 'aEthUSDT',
      protocolAction: ProtocolAction.supply,
      customMessage: 'You must supply wBTC and borrow USDT in order to receive merit rewards.',
    },
    USDT: {
      action: MeritAction.SUPPLY_WBTC_BORROW_USDT,
      rewardTokenAddress: AaveV3Ethereum.ASSETS.USDT.A_TOKEN,
      rewardTokenSymbol: 'aEthUSDT',
      protocolAction: ProtocolAction.borrow,
      customMessage: 'You must supply wBTC and borrow USDT in order to receive merit rewards.',
    },
  },
};

export const useMeritIncentives = ({
  symbol,
  market,
  protocolAction,
}: {
  symbol: string;
  market: string;
  protocolAction?: ProtocolAction;
}) => {
  return useQuery({
    queryFn: async () => {
      const response = await fetch(url);
      const data = await response.json();
      const meritIncentives = data.currentAPR as MeritIncentives;

      return meritIncentives;
    },
    queryKey: ['meritIncentives'],
    staleTime: 1000 * 60 * 5,
    select: (data) => {
      const meritReserveIncentiveData = getMeritData(market, symbol);
      if (!meritReserveIncentiveData) {
        return null;
      }
      if (meritReserveIncentiveData.protocolAction !== protocolAction) {
        return null;
      }

      const APR = data.actionsAPR[meritReserveIncentiveData.action];

      return {
        incentiveAPR: (APR / 100).toString(),
        rewardTokenAddress: meritReserveIncentiveData.rewardTokenAddress,
        rewardTokenSymbol: meritReserveIncentiveData.rewardTokenSymbol,
        customMessage: meritReserveIncentiveData.customMessage,
      } as ExtendedReserveIncentiveResponse;
    },
  });
};
