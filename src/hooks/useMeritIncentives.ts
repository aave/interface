import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import {
  AaveSafetyModule,
  AaveV3Arbitrum,
  AaveV3Avalanche,
  AaveV3Base,
  AaveV3Celo,
  AaveV3Ethereum,
  AaveV3EthereumLido,
  AaveV3Gnosis,
  AaveV3Sonic,
} from '@bgd-labs/aave-address-book';
import { useQuery } from '@tanstack/react-query';
import { CustomMarket } from 'src/ui-config/marketsConfig';

export enum MeritAction {
  ETHEREUM_SGHO = 'ethereum-sgho',
  ETHEREUM_SUPPLY_PYUSD = 'ethereum-supply-pyusd',
  ETHEREUM_SUPPLY_ETHX = 'ethereum-supply-ethx',
  ETHEREUM_SUPPLY_RLUSD = 'ethereum-supply-rlusd',
  ETHEREUM_PRIME_SUPPLY_ETH = 'ethereum-prime-supply-weth',
  ETHEREUM_PRIME_SUPPLY_EZETH = 'ethereum-prime-supply-ezeth',
  SUPPLY_CBBTC_BORROW_USDC = 'ethereum-supply-cbbtc-borrow-usdc',
  SUPPLY_WBTC_BORROW_USDT = 'ethereum-supply-wbtc-borrow-usdt',
  SUPPLY_WEETH_BORROW_USDC = 'ethereum-supply-weeth-borrow-usdc',
  ETHEREUM_BORROW_EURC = 'ethereum-borrow-eurc',
  ARBITRUM_SUPPLY_ETH = 'arbitrum-supply-weth',
  ARBITRUM_SUPPLY_WSTETH = 'arbitrum-supply-wsteth',
  ARBITRUM_SUPPLY_EZETH = 'arbitrum-supply-ezeth',
  BASE_SUPPLY_CBBTC = 'base-supply-cbbtc',
  BASE_SUPPLY_USDC = 'base-supply-usdc',
  BASE_SUPPLY_WSTETH = 'base-supply-wsteth',
  BASE_SUPPLY_WEETH = 'base-supply-weeth',
  BASE_SUPPLY_EZETH = 'base-supply-ezeth',
  BASE_SUPPLY_EURC = 'base-supply-eurc',
  BASE_SUPPLY_GHO = 'base-supply-gho',
  BASE_SUPPLY_LBTC_BORROW_CBBTC = 'base-supply-lbtc-borrow-cbbtc',
  BASE_SUPPLY_CBBTC_BORROW_MULTIPLE = 'base-supply-cbbtc-borrow-multiple',
  BASE_SUPPLY_WSTETH_BORROW_MULTIPLE = 'base-supply-wsteth-borrow-multiple',
  BASE_SUPPLY_WETH_BORROW_MULTIPLE = 'base-supply-eth-borrow-multiple',
  BASE_BORROW_EURC = 'base-borrow-eurc',
  BASE_BORROW_USDC = 'base-borrow-usdc',
  BASE_BORROW_WSTETH = 'base-borrow-wsteth',
  BASE_BORROW_GHO = 'base-borrow-gho',
  AVALANCHE_SUPPLY_BTCB = 'avalanche-supply-btcb',
  AVALANCHE_SUPPLY_USDC = 'avalanche-supply-usdc',
  AVALANCHE_SUPPLY_USDT = 'avalanche-supply-usdt',
  AVALANCHE_SUPPLY_SAVAX = 'avalanche-supply-savax',
  AVALANCHE_SUPPLY_AUSD = 'avalanche-supply-ausd',
  AVALANCHE_SUPPLY_GHO = 'avalanche-supply-gho',
  SONIC_SUPPLY_USDCE = 'sonic-supply-usdce',
  SONIC_SUPPLY_STS_BORROW_WS = 'sonic-supply-sts-borrow-ws',
  GNOSIS_BORROW_EURE = 'gnosis-borrow-eure',
  CELO_SUPPLY_CELO = 'celo-supply-celo',
  CELO_SUPPLY_USDT = 'celo-supply-usdt',
  CELO_SUPPLY_USDC = 'celo-supply-usdc',
  CELO_SUPPLY_WETH = 'celo-supply-weth',
  CELO_BORROW_CELO = 'celo-borrow-celo',
  CELO_BORROW_USDT = 'celo-borrow-usdt',
  CELO_BORROW_USDC = 'celo-borrow-usdc',
  CELO_BORROW_WETH = 'celo-borrow-weth',
}

type MeritIncentives = {
  totalAPR: number;
  actionsAPR: {
    [key in MeritAction]: number | null | undefined;
  };
};

export type ExtendedReserveIncentiveResponse = ReserveIncentiveResponse & {
  action: MeritAction;
  customMessage: string;
  customForumLink: string;
};

const url = 'https://apps.aavechan.com/api/merit/aprs';

export type MeritReserveIncentiveData = Omit<ReserveIncentiveResponse, 'incentiveAPR'> & {
  action: MeritAction;
  customMessage?: string;
  customForumLink?: string;
  protocolAction?: ProtocolAction;
};

const getMeritData = (market: string, symbol: string): MeritReserveIncentiveData[] | undefined =>
  MERIT_DATA_MAP[market]?.[symbol];

const antiLoopMessage =
  'Borrowing of some assets or holding of some token may impact the amount of rewards you are eligible for. Please check the forum post for the full eligibility criteria.';

const antiLoopBorrowMessage =
  'Supplying of some assets or holding of some token may impact the amount of rewards you are eligible for. Please check the forum post for the full eligibility criteria.';

const lbtcCbbtcCampaignMessage =
  'You must supply LBTC and borrow cbBTC, while maintaining a health factor of 1.5 or below, in order to receive merit rewards. Please check the forum post for the full eligibility criteria.';

const StSLoopIncentiveProgramMessage =
  'You must supply stS and borrow wS in order to receive merit rewards. stS/wS e-mode can be used to maximize stS/wS loop. Please check the forum post for the full eligibility criteria.';

const weethUsdcCampaignMessage =
  'You must supply weETH and borrow new USDC, while maintaining a health factor of 2 or below, in order to receive merit rewards. Eligibility criteria for this campaign are different from usual, please refer to the forum post for full details.';

const baseIncentivesCbbtcCampaignsMessage =
  'You must supply cbBTC and borrow USDC, GHO, EURC or wETH to receive Merit rewards. Holding some assets or positions on other protocols may impact the amount of rewards you are eligible for. Please check the forum post for the full eligibility criteria.';

const baseIncentivesWstETHCampaignsMessage =
  'You must supply wstETH and borrow USDC, GHO, EURC or wETH to receive Merit rewards. Holding some assets or positions on other protocols may impact the amount of rewards you are eligible for. Please check the forum post for the full eligibility criteria.';

const baseIncentivesETHCampaignsMessage =
  'Supplying ETH alone earns 1.25%, supplying ETH and borrowing USDC or EURC earns 1.50%, supplying ETH and borrowing GHO earns 1.75%. Some assets holding or positions on other protocols may impact the amount of rewards you are eligible for. Please check the forum post for the full eligibility criteria.';

const joinedEthCorrelatedIncentiveForumLink =
  'https://governance.aave.com/t/arfc-set-aci-as-emission-manager-for-liquidity-mining-programs/17898/56';

const joinedEthCorrelatedIncentivePhase2ForumLink =
  'https://governance.aave.com/t/arfc-set-aci-as-emission-manager-for-liquidity-mining-programs/17898/70';

const eurcForumLink =
  'https://governance.aave.com/t/arfc-set-aci-as-emission-manager-for-liquidity-mining-programs/17898/77';

const AusdRenewalForumLink =
  'https://governance.aave.com/t/arfc-set-aci-as-emission-manager-for-liquidity-mining-programs/17898/88';
const AvalancheRenewalForumLink =
  'https://governance.aave.com/t/arfc-set-aci-as-emission-manager-for-liquidity-mining-programs/17898/89';

const lbtcCbbtcForumLink =
  'https://governance.aave.com/t/arfc-set-aci-as-emission-manager-for-liquidity-mining-programs/17898/91';

const weethUsdcForumLink =
  'https://governance.aave.com/t/arfc-set-aci-as-emission-manager-for-liquidity-mining-programs/17898/120';

const StSLoopIncentiveProgramForumLink =
  'https://governance.aave.com/t/arfc-sts-loop-incentive-program/22368';

const baseIncentivesForumLink =
  'https://governance.aave.com/t/arfc-base-incentive-campaign-funding/21983';

const MERIT_DATA_MAP: Record<string, Record<string, MeritReserveIncentiveData[]>> = {
  [CustomMarket.proto_mainnet_v3]: {
    GHO: [
      {
        action: MeritAction.ETHEREUM_SGHO,
        rewardTokenAddress: AaveSafetyModule.STK_GHO,
        rewardTokenSymbol: 'sGHO',
        customForumLink:
          'https://governance.aave.com/t/arfc-merit-a-new-aave-alignment-user-reward-system/16646',
      },
    ],
    // cbBTC: [
    //   {
    //     action: MeritAction.SUPPLY_CBBTC_BORROW_USDC,
    //     rewardTokenAddress: AaveV3Ethereum.ASSETS.USDC.A_TOKEN,
    //     rewardTokenSymbol: 'aEthUSDC',
    //     protocolAction: ProtocolAction.supply,
    //     customMessage: 'You must supply cbBTC and borrow USDC in order to receive merit rewards.',
    //   },
    // ],
    USDC: [
      // {
      //   action: MeritAction.SUPPLY_CBBTC_BORROW_USDC,
      //   rewardTokenAddress: AaveV3Ethereum.ASSETS.USDC.A_TOKEN,
      //   rewardTokenSymbol: 'aEthUSDC',
      //   protocolAction: ProtocolAction.borrow,
      //   customMessage: 'You must supply cbBTC and borrow USDC in order to receive merit rewards.',
      // },
      {
        action: MeritAction.SUPPLY_WEETH_BORROW_USDC,
        rewardTokenAddress: AaveV3Ethereum.ASSETS.USDC.A_TOKEN,
        rewardTokenSymbol: 'ETHFI',
        protocolAction: ProtocolAction.borrow,
        customMessage: weethUsdcCampaignMessage,
        customForumLink: weethUsdcForumLink,
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
        customMessage: antiLoopMessage,
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
    RLUSD: [
      {
        action: MeritAction.ETHEREUM_SUPPLY_RLUSD,
        rewardTokenAddress: AaveV3Ethereum.ASSETS.RLUSD.A_TOKEN,
        rewardTokenSymbol: 'aEthRLUSD',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
        customForumLink:
          'https://governance.aave.com/t/arfc-set-aci-as-emission-manager-for-liquidity-mining-programs/17898/85',
      },
    ],
    weETH: [
      {
        action: MeritAction.SUPPLY_WEETH_BORROW_USDC,
        rewardTokenAddress: AaveV3Ethereum.ASSETS.weETH.A_TOKEN,
        rewardTokenSymbol: 'ETHFI',
        protocolAction: ProtocolAction.supply,
        customMessage: weethUsdcCampaignMessage,
        customForumLink: weethUsdcForumLink,
      },
    ],
    EURC: [
      {
        action: MeritAction.ETHEREUM_BORROW_EURC,
        rewardTokenAddress: AaveV3Ethereum.ASSETS.EURC.A_TOKEN,
        rewardTokenSymbol: 'aEthEURC',
        protocolAction: ProtocolAction.borrow,
        customMessage: antiLoopBorrowMessage,
      },
    ],
  },
  [CustomMarket.proto_lido_v3]: {
    ETH: [
      {
        action: MeritAction.ETHEREUM_PRIME_SUPPLY_ETH,
        rewardTokenAddress: AaveV3EthereumLido.ASSETS.WETH.A_TOKEN,
        rewardTokenSymbol: 'aEthLidoWETH',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
        customForumLink: joinedEthCorrelatedIncentiveForumLink,
      },
    ],
    WETH: [
      {
        action: MeritAction.ETHEREUM_PRIME_SUPPLY_ETH,
        rewardTokenAddress: AaveV3EthereumLido.ASSETS.WETH.A_TOKEN,
        rewardTokenSymbol: 'aEthLidoWETH',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
        customForumLink: joinedEthCorrelatedIncentiveForumLink,
      },
    ],
    ezETH: [
      {
        action: MeritAction.ETHEREUM_PRIME_SUPPLY_EZETH,
        rewardTokenAddress: '0x3B50805453023a91a8bf641e279401a0b23FA6F9', // Renzo (REZ)
        rewardTokenSymbol: 'REZ',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
        customForumLink: joinedEthCorrelatedIncentiveForumLink,
      },
    ],
  },
  [CustomMarket.proto_arbitrum_v3]: {
    ETH: [
      {
        action: MeritAction.ARBITRUM_SUPPLY_ETH,
        rewardTokenAddress: AaveV3Arbitrum.ASSETS.WETH.A_TOKEN,
        rewardTokenSymbol: 'aArbWETH',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
        customForumLink: joinedEthCorrelatedIncentiveForumLink,
      },
    ],
    WETH: [
      {
        action: MeritAction.ARBITRUM_SUPPLY_ETH,
        rewardTokenAddress: AaveV3Arbitrum.ASSETS.WETH.A_TOKEN,
        rewardTokenSymbol: 'aArbWETH',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
        customForumLink: joinedEthCorrelatedIncentiveForumLink,
      },
    ],
    wstETH: [
      {
        action: MeritAction.ARBITRUM_SUPPLY_WSTETH,
        rewardTokenAddress: AaveV3Ethereum.ASSETS.wstETH.UNDERLYING,
        rewardTokenSymbol: 'aArbwstETH',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
        customForumLink: joinedEthCorrelatedIncentiveForumLink,
      },
    ],
    ezETH: [
      {
        action: MeritAction.ARBITRUM_SUPPLY_EZETH,
        rewardTokenAddress: '0x3B50805453023a91a8bf641e279401a0b23FA6F9', // Renzo (REZ)
        rewardTokenSymbol: 'REZ',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
        customForumLink: joinedEthCorrelatedIncentiveForumLink,
      },
    ],
  },
  [CustomMarket.proto_base_v3]: {
    cbBTC: [
      // {
      //   action: MeritAction.BASE_SUPPLY_CBBTC,
      //   rewardTokenAddress: AaveV3Base.ASSETS.USDC.A_TOKEN,
      //   rewardTokenSymbol: 'aBasUSDC',
      //   protocolAction: ProtocolAction.supply,
      // },
      {
        action: MeritAction.BASE_SUPPLY_CBBTC_BORROW_MULTIPLE,
        rewardTokenAddress: AaveV3Base.ASSETS.cbBTC.A_TOKEN,
        rewardTokenSymbol: 'aBasCBBTC',
        protocolAction: ProtocolAction.supply,
        customMessage: baseIncentivesCbbtcCampaignsMessage,
        customForumLink: baseIncentivesForumLink,
      },
      {
        action: MeritAction.BASE_SUPPLY_LBTC_BORROW_CBBTC,
        rewardTokenAddress: AaveV3Base.ASSETS.USDC.A_TOKEN,
        rewardTokenSymbol: 'aBasUSDC',
        protocolAction: ProtocolAction.borrow,
        customMessage: lbtcCbbtcCampaignMessage,
        customForumLink: lbtcCbbtcForumLink,
      },
    ],
    USDC: [
      {
        action: MeritAction.BASE_SUPPLY_USDC,
        rewardTokenAddress: AaveV3Base.ASSETS.USDC.A_TOKEN,
        rewardTokenSymbol: 'aBasUSDC',
        protocolAction: ProtocolAction.supply,
      },
      {
        action: MeritAction.BASE_BORROW_USDC,
        rewardTokenAddress: AaveV3Base.ASSETS.USDC.A_TOKEN,
        rewardTokenSymbol: 'aBasUSDC',
        protocolAction: ProtocolAction.borrow,
      },
    ],
    wstETH: [
      // {
      //   action: MeritAction.BASE_SUPPLY_WSTETH,
      //   rewardTokenAddress: AaveV3Base.ASSETS.wstETH.A_TOKEN,
      //   rewardTokenSymbol: 'aBaswstETH',
      //   protocolAction: ProtocolAction.supply,
      //   customMessage: antiLoopMessage,
      //   customForumLink: joinedEthCorrelatedIncentiveForumLink,
      // },
      {
        action: MeritAction.BASE_SUPPLY_WSTETH_BORROW_MULTIPLE,
        rewardTokenAddress: AaveV3Base.ASSETS.wstETH.A_TOKEN,
        rewardTokenSymbol: 'aBaswstETH',
        protocolAction: ProtocolAction.supply,
        customMessage: baseIncentivesWstETHCampaignsMessage,
        customForumLink: baseIncentivesForumLink,
      },
      {
        action: MeritAction.BASE_BORROW_WSTETH,
        rewardTokenAddress: AaveV3Base.ASSETS.wstETH.A_TOKEN,
        rewardTokenSymbol: 'aBaswstETH',
        protocolAction: ProtocolAction.borrow,
        customMessage: antiLoopBorrowMessage,
        customForumLink: joinedEthCorrelatedIncentivePhase2ForumLink,
      },
    ],
    ezETH: [
      {
        action: MeritAction.BASE_SUPPLY_EZETH,
        rewardTokenAddress: '0x3B50805453023a91a8bf641e279401a0b23FA6F9', // Renzo (REZ)
        rewardTokenSymbol: 'REZ',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
        customForumLink: joinedEthCorrelatedIncentiveForumLink,
      },
    ],
    weETH: [
      {
        action: MeritAction.BASE_SUPPLY_WEETH,
        rewardTokenAddress: AaveV3Base.ASSETS.weETH.A_TOKEN,
        rewardTokenSymbol: 'aBasweETH',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
        customForumLink: joinedEthCorrelatedIncentivePhase2ForumLink,
      },
    ],
    EURC: [
      {
        action: MeritAction.BASE_SUPPLY_EURC,
        rewardTokenAddress: AaveV3Base.ASSETS.EURC.A_TOKEN,
        rewardTokenSymbol: 'aBasEURC',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
        customForumLink: eurcForumLink,
      },
      {
        action: MeritAction.BASE_BORROW_EURC,
        rewardTokenAddress: AaveV3Base.ASSETS.EURC.A_TOKEN,
        rewardTokenSymbol: 'aBasEURC',
        protocolAction: ProtocolAction.borrow,
        customMessage: antiLoopBorrowMessage,
        customForumLink: eurcForumLink,
      },
    ],
    LBTC: [
      {
        action: MeritAction.BASE_SUPPLY_LBTC_BORROW_CBBTC,
        rewardTokenAddress: AaveV3Base.ASSETS.USDC.A_TOKEN,
        rewardTokenSymbol: 'aBasUSDC',
        protocolAction: ProtocolAction.supply,
        customMessage: lbtcCbbtcCampaignMessage,
        customForumLink: lbtcCbbtcForumLink,
      },
    ],
    GHO: [
      {
        action: MeritAction.BASE_SUPPLY_GHO,
        rewardTokenAddress: AaveV3Base.ASSETS.GHO.A_TOKEN,
        rewardTokenSymbol: 'aBasGHO',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
      },
      {
        action: MeritAction.BASE_BORROW_GHO,
        rewardTokenAddress: AaveV3Base.ASSETS.GHO.A_TOKEN,
        rewardTokenSymbol: 'aBasGHO',
        protocolAction: ProtocolAction.borrow,
        customMessage: antiLoopBorrowMessage,
        customForumLink:
          'https://governance.aave.com/t/arfc-set-aci-as-emission-manager-for-liquidity-mining-programs/17898/94',
      },
    ],
    WETH: [
      {
        action: MeritAction.BASE_SUPPLY_WETH_BORROW_MULTIPLE,
        rewardTokenAddress: AaveV3Base.ASSETS.WETH.A_TOKEN,
        rewardTokenSymbol: 'aBasWETH',
        protocolAction: ProtocolAction.supply,
        customMessage: baseIncentivesETHCampaignsMessage,
      },
    ],
    ETH: [
      {
        action: MeritAction.BASE_SUPPLY_WETH_BORROW_MULTIPLE,
        rewardTokenAddress: AaveV3Base.ASSETS.WETH.A_TOKEN,
        rewardTokenSymbol: 'aBasWETH',
        protocolAction: ProtocolAction.supply,
        customMessage: baseIncentivesETHCampaignsMessage,
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
        customMessage: antiLoopMessage,
        customForumLink: AvalancheRenewalForumLink,
      },
    ],
    USDC: [
      {
        action: MeritAction.AVALANCHE_SUPPLY_USDC,
        rewardTokenAddress: AaveV3Avalanche.ASSETS.USDC.A_TOKEN,
        rewardTokenSymbol: 'aAvaSAVAX',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
        customForumLink: AvalancheRenewalForumLink,
      },
    ],
    USDt: [
      {
        action: MeritAction.AVALANCHE_SUPPLY_USDT,
        rewardTokenAddress: AaveV3Avalanche.ASSETS.USDt.A_TOKEN,
        rewardTokenSymbol: 'aAvaSAVAX',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
        customForumLink: AvalancheRenewalForumLink,
      },
    ],
    sAVAX: [
      {
        action: MeritAction.AVALANCHE_SUPPLY_SAVAX,
        rewardTokenAddress: AaveV3Avalanche.ASSETS.sAVAX.A_TOKEN,
        rewardTokenSymbol: 'aAvaSAVAX',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
        customForumLink: AvalancheRenewalForumLink,
      },
    ],
    AUSD: [
      {
        action: MeritAction.AVALANCHE_SUPPLY_AUSD,
        rewardTokenAddress: AaveV3Avalanche.ASSETS.AUSD.A_TOKEN,
        rewardTokenSymbol: 'aAvaSAVAX',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
        customForumLink: AusdRenewalForumLink,
      },
    ],
    GHO: [
      {
        action: MeritAction.AVALANCHE_SUPPLY_GHO,
        rewardTokenAddress: AaveV3Avalanche.ASSETS.GHO.A_TOKEN,
        rewardTokenSymbol: 'aAvaSAVAX',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
      },
    ],
  },
  [CustomMarket.proto_sonic_v3]: {
    ['USDC']: [
      {
        action: MeritAction.SONIC_SUPPLY_USDCE,
        rewardTokenAddress: AaveV3Sonic.ASSETS.USDC.A_TOKEN,
        rewardTokenSymbol: 'aSonwS',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
        customForumLink:
          'https://governance.aave.com/t/arfc-set-aci-as-emission-manager-for-liquidity-mining-programs/17898/61',
      },
    ],
    ['stS']: [
      {
        action: MeritAction.SONIC_SUPPLY_STS_BORROW_WS,
        rewardTokenAddress: AaveV3Sonic.ASSETS.stS.A_TOKEN,
        rewardTokenSymbol: 'aSonstS',
        protocolAction: ProtocolAction.supply,
        customMessage: StSLoopIncentiveProgramMessage,
        customForumLink: StSLoopIncentiveProgramForumLink,
      },
    ],
    ['S']: [
      {
        action: MeritAction.SONIC_SUPPLY_STS_BORROW_WS,
        rewardTokenAddress: AaveV3Sonic.ASSETS.stS.A_TOKEN,
        rewardTokenSymbol: 'aSonstS',
        protocolAction: ProtocolAction.borrow,
        customMessage: StSLoopIncentiveProgramMessage,
        customForumLink: StSLoopIncentiveProgramForumLink,
      },
    ],
  },
  [CustomMarket.proto_gnosis_v3]: {
    ['EURe']: [
      {
        action: MeritAction.GNOSIS_BORROW_EURE,
        rewardTokenAddress: AaveV3Gnosis.ASSETS.EURe.V_TOKEN,
        rewardTokenSymbol: 'aGnoEURe',
        protocolAction: ProtocolAction.borrow,
        customMessage: antiLoopMessage,
        customForumLink:
          'https://governance.aave.com/t/arfc-set-aci-as-emission-manager-for-liquidity-mining-programs/17898/83',
      },
    ],
  },
  [CustomMarket.proto_celo_v3]: {
    CELO: [
      {
        action: MeritAction.CELO_SUPPLY_CELO,
        rewardTokenAddress: AaveV3Celo.ASSETS.CELO.A_TOKEN,
        rewardTokenSymbol: 'aCelCELO',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
      },
      {
        action: MeritAction.CELO_BORROW_CELO,
        rewardTokenAddress: AaveV3Celo.ASSETS.CELO.A_TOKEN,
        rewardTokenSymbol: 'aCelCELO',
        protocolAction: ProtocolAction.borrow,
        customMessage: antiLoopBorrowMessage,
      },
    ],
    ['USD₮']: [
      {
        action: MeritAction.CELO_SUPPLY_USDT,
        rewardTokenAddress: AaveV3Celo.ASSETS.CELO.A_TOKEN,
        rewardTokenSymbol: 'aCelCELO',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
      },
      {
        action: MeritAction.CELO_BORROW_USDT,
        rewardTokenAddress: AaveV3Celo.ASSETS.CELO.A_TOKEN,
        rewardTokenSymbol: 'aCelCELO',
        protocolAction: ProtocolAction.borrow,
        customMessage: antiLoopBorrowMessage,
      },
    ],
    USDC: [
      {
        action: MeritAction.CELO_SUPPLY_USDC,
        rewardTokenAddress: AaveV3Celo.ASSETS.CELO.A_TOKEN,
        rewardTokenSymbol: 'aCelCELO',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
      },
      {
        action: MeritAction.CELO_BORROW_USDC,
        rewardTokenAddress: AaveV3Celo.ASSETS.CELO.A_TOKEN,
        rewardTokenSymbol: 'aCelCELO',
        protocolAction: ProtocolAction.borrow,
        customMessage: antiLoopBorrowMessage,
      },
    ],
    WETH: [
      {
        action: MeritAction.CELO_SUPPLY_WETH,
        rewardTokenAddress: AaveV3Celo.ASSETS.CELO.A_TOKEN,
        rewardTokenSymbol: 'aCelCELO',
        protocolAction: ProtocolAction.supply,
        customMessage: antiLoopMessage,
      },
      {
        action: MeritAction.CELO_BORROW_WETH,
        rewardTokenAddress: AaveV3Celo.ASSETS.CELO.A_TOKEN,
        rewardTokenSymbol: 'aCelCELO',
        protocolAction: ProtocolAction.borrow,
        customMessage: antiLoopBorrowMessage,
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
        action: incentive.action,
        customMessage: incentive.customMessage,
        customForumLink: incentive.customForumLink,
      } as ExtendedReserveIncentiveResponse;
    },
  });
};
