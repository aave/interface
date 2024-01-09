import { ChainId } from '@aave/contract-helpers';
import {
  AaveSafetyModule,
  AaveV3Ethereum,
  GovernanceV3Arbitrum,
  GovernanceV3Avalanche,
  GovernanceV3Base,
  GovernanceV3Ethereum,
  GovernanceV3Gnosis,
  GovernanceV3Metis,
  GovernanceV3Optimism,
  GovernanceV3Polygon,
} from '@bgd-labs/aave-address-book';

export const ipfsGateway = 'https://cloudflare-ipfs.com/ipfs';
export const fallbackIpfsGateway = 'https://ipfs.io/ipfs';

export interface VotingMachineConfig {
  portalToMachineMap: { [votingPoralAddress: string]: string };
  votingPortalDataHelperAddress: string;
  votingMachineAddress: string;
  subgraphUrl: string;
}

export interface GovernanceV3Config {
  coreChainId: ChainId;
  votingChainIds: ChainId[];
  governanceCoreSubgraphUrl: string;
  votingChainConfig: { [chainId: number]: VotingMachineConfig };
  payloadsControllerDataHelpers: { [chainId: number]: string };
  addresses: {
    GOVERNANCE_CORE: string;
    GOVERNANCE_DATA_HELPER: string;
    WALLET_BALANCE_PROVIDER: string;
    GOVERNANCE_META_HELPER: string;
    TOKEN_POWER_HELPER: string;
  };
  votingAssets: {
    aaveTokenAddress: string;
    aAaveTokenAddress: string;
    stkAaveTokenAddress: string;
  };
}

const sepoliaVotingMachineConfig: VotingMachineConfig = {
  portalToMachineMap: {
    '0x1079bAa48E56065d43b4344866B187a485cb0A92': '0xA1995F1d5A8A247c064a76F336E1C2ecD24Ef0D9',
  },
  votingPortalDataHelperAddress: '0x133210F3fe2deEB34e65deB6861ee3dF87393977',
  votingMachineAddress: '0xA1995F1d5A8A247c064a76F336E1C2ecD24Ef0D9',
  subgraphUrl:
    'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/votingmachine-sepolia/v1/gn',
};

const fujiVotingMachineConfig: VotingMachineConfig = {
  portalToMachineMap: {
    '0x4f47EdF2577995aBd7B875Eed75b3F28a20E696F': '0x767AA57554690D23D1E0594E8746271C97e1A1e4',
  },
  votingPortalDataHelperAddress: '0x133210F3fe2deEB34e65deB6861ee3dF87393977',
  votingMachineAddress: '0x767AA57554690D23D1E0594E8746271C97e1A1e4',
  subgraphUrl:
    'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/votingmachine-sepolia-avalanche-testnet/v2/gn',
};

type GovernanceChainConfig = {
  [chainId: number]: GovernanceV3Config;
};

export const governanceChainConfig: GovernanceChainConfig = {
  [ChainId.sepolia]: {
    coreChainId: ChainId.sepolia,
    votingChainIds: [ChainId.sepolia, ChainId.fuji],
    governanceCoreSubgraphUrl:
      'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/governance-v3/v2.0.1/gn',
    votingChainConfig: {
      [ChainId.sepolia]: sepoliaVotingMachineConfig,
      [ChainId.fuji]: fujiVotingMachineConfig,
    },
    payloadsControllerDataHelpers: {
      [ChainId.sepolia]: '0x6B9AF21B95FE20b5a878b43670c23124841ec31A',
      [ChainId.fuji]: '0x6B9AF21B95FE20b5a878b43670c23124841ec31A',
    },
    votingAssets: {
      aaveTokenAddress: '0xdaEcee477B931b209e8123401EA37582ACB3811d',
      stkAaveTokenAddress: '0x354032B31339853A3D682613749F183328d07275',
      aAaveTokenAddress: '0x26aAB2aE39897338c2d91491C46c14a8c2a67919',
    },
    addresses: {
      GOVERNANCE_CORE: '0xc4ABF658C3Dda84225cF8A07d7D5Bb6Aa41d9E59',
      GOVERNANCE_DATA_HELPER: '0x863f9De2f82AB502612E8B7d4f4863c8535cb8cA',
      WALLET_BALANCE_PROVIDER: '0xCD4e0d6D2b1252E2A709B8aE97DBA31164C5a709',
      GOVERNANCE_META_HELPER: '0x8aFD68632A4B4d9fB3F2956Ca921Eb2d69146491',
      TOKEN_POWER_HELPER: '0x78b04AD18d76B6E2F41C84af4C4C5C5c61b60a10',
    },
  },
  [ChainId.mainnet]: {
    coreChainId: ChainId.mainnet,
    votingChainIds: [ChainId.polygon, ChainId.avalanche],
    governanceCoreSubgraphUrl:
      'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/test-gov/1.0.7/gn',
    votingChainConfig: {
      [ChainId.mainnet]: {
        portalToMachineMap: {
          [GovernanceV3Ethereum.VOTING_PORTAL_ETH_ETH]: GovernanceV3Ethereum.VOTING_MACHINE,
        },
        votingPortalDataHelperAddress: GovernanceV3Ethereum.VM_DATA_HELPER,
        votingMachineAddress: GovernanceV3Ethereum.VOTING_MACHINE,
        subgraphUrl:
          'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/gov-v3-voting-machine-mainnet/1/gn',
      },
      [ChainId.polygon]: {
        portalToMachineMap: {
          [GovernanceV3Ethereum.VOTING_PORTAL_ETH_POL]: GovernanceV3Polygon.VOTING_MACHINE,
        },
        votingPortalDataHelperAddress: GovernanceV3Polygon.VM_DATA_HELPER,
        votingMachineAddress: GovernanceV3Polygon.VOTING_MACHINE,
        subgraphUrl:
          'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/gov-v3-voting-machine-matic/1/gn',
      },
      [ChainId.avalanche]: {
        portalToMachineMap: {
          [GovernanceV3Ethereum.VOTING_PORTAL_ETH_AVAX]: GovernanceV3Avalanche.VOTING_MACHINE,
        },
        votingPortalDataHelperAddress: GovernanceV3Avalanche.VM_DATA_HELPER,
        votingMachineAddress: GovernanceV3Avalanche.VOTING_MACHINE,
        subgraphUrl:
          'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/gov-v3-voting-machine-avalanche/1/gn',
      },
    },
    payloadsControllerDataHelpers: {
      [ChainId.mainnet]: GovernanceV3Ethereum.PC_DATA_HELPER,
      [ChainId.polygon]: GovernanceV3Polygon.PC_DATA_HELPER,
      [ChainId.avalanche]: GovernanceV3Avalanche.PC_DATA_HELPER,
      [ChainId.optimism]: GovernanceV3Optimism.PC_DATA_HELPER,
      [ChainId.xdai]: GovernanceV3Gnosis.PC_DATA_HELPER,
      [ChainId.arbitrum_one]: GovernanceV3Arbitrum.PC_DATA_HELPER,
      [ChainId.base]: GovernanceV3Base.PC_DATA_HELPER,
      [ChainId.metis_andromeda]: GovernanceV3Metis.PC_DATA_HELPER,
    },
    votingAssets: {
      aaveTokenAddress: AaveV3Ethereum.ASSETS.AAVE.UNDERLYING,
      aAaveTokenAddress: AaveV3Ethereum.ASSETS.AAVE.A_TOKEN,
      stkAaveTokenAddress: AaveSafetyModule.STK_AAVE,
    },
    addresses: {
      GOVERNANCE_CORE: GovernanceV3Ethereum.GOVERNANCE,
      GOVERNANCE_DATA_HELPER: GovernanceV3Ethereum.GOV_DATA_HELPER,
      WALLET_BALANCE_PROVIDER: AaveV3Ethereum.WALLET_BALANCE_PROVIDER,
      GOVERNANCE_META_HELPER: GovernanceV3Ethereum.META_DELEGATE_HELPER,
      TOKEN_POWER_HELPER: '0xBb7baf0534423e3108E1D03c259104cDba2C1cB7',
    },
  },
};

const coreNetwork = ChainId.mainnet;
export const governanceV3Config = governanceChainConfig[coreNetwork];
