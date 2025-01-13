import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { AaveV3Avalanche, AaveV3Base, AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { useQuery } from '@tanstack/react-query';
import { CustomMarket } from 'src/ui-config/marketsConfig';

export enum MeritAction {
  ETHEREUM_STKGHO = 'ethereum-stkgho',
  ETHEREUM_SUPPLY_PYUSD = 'ethereum-supply-pyusd',
  ETHEREUM_SUPPLY_ETHX = 'ethereum-supply-ethx',
  SUPPLY_CBBTC_BORROW_USDC = 'ethereum-supply-cbbtc-borrow-usdc',
  SUPPLY_WBTC_BORROW_USDT = 'ethereum-supply-wbtc-borrow-usdt',
  BASE_SUPPLY_CBBTC = 'base-supply-cbbtc',
  BASE_SUPPLY_USDC = 'base-supply-usdc',
  BASE_BORROW_USDC = 'base-borrow-usdc',
  AVALANCHE_SUPPLY_BTCB = 'avalanche-supply-btcb',
  AVALANCHE_SUPPLY_USDC = 'avalanche-supply-usdc',
  AVALANCHE_SUPPLY_USDT = 'avalanche-supply-usdt',
  AVALANCHE_SUPPLY_SAVAX = 'avalanche-supply-savax',
  AVALANCHE_SUPPLY_AUSD = 'avalanche-supply-ausd',
}

type MeritIncentives = {
  totalAPR: number;
  actionsAPR: {
    [key in MeritAction]: number | null | undefined;
  };
};

export type ExtendedReserveIncentiveResponse = ReserveIncentiveResponse & {
  customMessage: string;
  customForumLink: string;
};

const url = 'https://apps.aavechan.com/api/merit/aprs';

export type MeritReserveIncentiveData = Omit<ReserveIncentiveResponse, 'incentiveAPR'> & {
  action: MeritAction;
  protocolAction?: ProtocolAction;
  customMessage?: string;
  customForumLink?: string;
};

const getMeritData = (market: string, symbol: string): MeritReserveIncentiveData[] | undefined =>
  MERIT_DATA_MAP[market]?.[symbol];

const MERIT_DATA_MAP: Record<string, Record<string, MeritReserveIncentiveData[]>> = {
  [CustomMarket.proto_mainnet_v3]: {
    GHO: [
      {
        action: MeritAction.ETHEREUM_STKGHO,
        rewardTokenAddress: AaveV3Ethereum.ASSETS.GHO.UNDERLYING,
        rewardTokenSymbol: 'GHO',
        customForumLink:
          'https://governance.aave.com/t/arfc-merit-a-new-aave-alignment-user-reward-system/16646',
      },
    ],
    cbBTC: [
      {
        action: MeritAction.SUPPLY_CBBTC_BORROW_USDC,
        rewardTokenAddress: AaveV3Ethereum.ASSETS.USDC.A_TOKEN,
        rewardTokenSymbol: 'aEthUSDC',
        protocolAction: ProtocolAction.supply,
        customMessage: 'You must supply cbBTC and borrow USDC in order to receive merit rewards.',
      },
    ],
    USDC: [
      {
        action: MeritAction.SUPPLY_CBBTC_BORROW_USDC,
        rewardTokenAddress: AaveV3Ethereum.ASSETS.USDC.A_TOKEN,
        rewardTokenSymbol: 'aEthUSDC',
        protocolAction: ProtocolAction.borrow,
        customMessage: 'You must supply cbBTC and borrow USDC in order to receive merit rewards.',
      },
    ],
    WBTC: [
      {
        action: MeritAction.SUPPLY_WBTC_BORROW_USDT,
        rewardTokenAddress: AaveV3Ethereum.ASSETS.USDT.A_TOKEN,
        rewardTokenSymbol: 'aEthUSDT',
        protocolAction: ProtocolAction.supply,
        customMessage: 'You must supply wBTC and borrow USDT in order to receive merit rewards.',
      },
    ],
    USDT: [
      {
        action: MeritAction.SUPPLY_WBTC_BORROW_USDT,
        rewardTokenAddress: AaveV3Ethereum.ASSETS.USDT.A_TOKEN,
        rewardTokenSymbol: 'aEthUSDT',
        protocolAction: ProtocolAction.borrow,
        customMessage: 'You must supply wBTC and borrow USDT in order to receive merit rewards.',
      },
    ],
    PYUSD: [
      {
        action: MeritAction.ETHEREUM_SUPPLY_PYUSD,
        rewardTokenAddress: AaveV3Ethereum.ASSETS.PYUSD.A_TOKEN,
        rewardTokenSymbol: 'aEthPYUSD',
        protocolAction: ProtocolAction.supply,
        customForumLink:
          'https://governance.aave.com/t/arfc-pyusd-reserve-configuration-update-incentive-campaign/19573',
        customMessage:
          'Borrowing of some assets may impact the amount of rewards you are eligible for. Please check the forum post for the full eligibility criteria.',
      },
    ],
    ETHx: [
      {
        action: MeritAction.ETHEREUM_SUPPLY_ETHX,
        rewardTokenAddress: '0x30D20208d987713f46DFD34EF128Bb16C404D10f', // Stader (SD)
        rewardTokenSymbol: 'SD',
        protocolAction: ProtocolAction.supply,
      },
    ],
  },
  [CustomMarket.proto_base_v3]: {
    cbBTC: [
      {
        action: MeritAction.BASE_SUPPLY_CBBTC,
        rewardTokenAddress: AaveV3Base.ASSETS.USDC.UNDERLYING,
        rewardTokenSymbol: 'aBasUSDC',
        protocolAction: ProtocolAction.supply,
      },
    ],
    USDC: [
      {
        action: MeritAction.BASE_SUPPLY_USDC,
        rewardTokenAddress: AaveV3Base.ASSETS.USDC.UNDERLYING,
        rewardTokenSymbol: 'aBasUSDC',
        protocolAction: ProtocolAction.supply,
      },
      {
        action: MeritAction.BASE_BORROW_USDC,
        rewardTokenAddress: AaveV3Base.ASSETS.USDC.UNDERLYING,
        rewardTokenSymbol: 'aBasUSDC',
        protocolAction: ProtocolAction.borrow,
      },
    ],
  },
  [CustomMarket.proto_avalanche_v3]: {
    ['BTC.b']: [
      {
        action: MeritAction.AVALANCHE_SUPPLY_BTCB,
        rewardTokenAddress: AaveV3Avalanche.ASSETS.BTCb.A_TOKEN,
        rewardTokenSymbol: 'aAvaSAVAX',
        protocolAction: ProtocolAction.supply,
      },
    ],
    USDC: [
      {
        action: MeritAction.AVALANCHE_SUPPLY_USDC,
        rewardTokenAddress: AaveV3Avalanche.ASSETS.USDC.A_TOKEN,
        rewardTokenSymbol: 'aAvaSAVAX',
        protocolAction: ProtocolAction.supply,
      },
    ],
    USDt: [
      {
        action: MeritAction.AVALANCHE_SUPPLY_USDT,
        rewardTokenAddress: AaveV3Avalanche.ASSETS.USDt.A_TOKEN,
        rewardTokenSymbol: 'aAvaSAVAX',
        protocolAction: ProtocolAction.supply,
      },
    ],
    sAVAX: [
      {
        action: MeritAction.AVALANCHE_SUPPLY_SAVAX,
        rewardTokenAddress: AaveV3Avalanche.ASSETS.sAVAX.A_TOKEN,
        rewardTokenSymbol: 'aAvaSAVAX',
        protocolAction: ProtocolAction.supply,
      },
    ],
    AUSD: [
      {
        action: MeritAction.AVALANCHE_SUPPLY_AUSD,
        rewardTokenAddress: AaveV3Avalanche.ASSETS.AUSD.A_TOKEN,
        rewardTokenSymbol: 'aAvaSAVAX',
        protocolAction: ProtocolAction.supply,
      },
    ],
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
      const incentive = meritReserveIncentiveData.find(
        (item) => item.protocolAction === protocolAction
      );

      if (!incentive) {
        return null;
      }

      const APR = data.actionsAPR[incentive.action];

      if (!APR) {
        return null;
      }

      return {
        incentiveAPR: (APR / 100).toString(),
        rewardTokenAddress: incentive.rewardTokenAddress,
        rewardTokenSymbol: incentive.rewardTokenSymbol,
        customMessage: incentive.customMessage,
        customForumLink: incentive.customForumLink,
      } as ExtendedReserveIncentiveResponse;
    },
  });
};
