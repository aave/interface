import { ChainId } from '@aave/contract-helpers';
import {
  AaveSafetyModule,
  AaveV3Arbitrum,
  AaveV3Ethereum,
  GovernanceV3Arbitrum,
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

type GovernanceChainConfig = {
  [chainId: number]: GovernanceV3Config;
};

export const governanceChainConfig: GovernanceChainConfig = {
  [ChainId.arbitrum_one]: {
    coreChainId: ChainId.arbitrum_one,
    votingChainIds: [ChainId.arbitrum_one],
    governanceCoreSubgraphUrl: '',
    votingChainConfig: {
      [ChainId.arbitrum_one]: {
        portalToMachineMap: {},
        votingPortalDataHelperAddress: '',
        votingMachineAddress: '',
        subgraphUrl: '',
      },
    },
    payloadsControllerDataHelpers: {
      [ChainId.arbitrum_one]: GovernanceV3Arbitrum.PC_DATA_HELPER,
    },
    votingAssets: {
      aaveTokenAddress: AaveV3Ethereum.ASSETS.AAVE.UNDERLYING,
      aAaveTokenAddress: AaveV3Ethereum.ASSETS.AAVE.A_TOKEN,
      stkAaveTokenAddress: AaveSafetyModule.STK_AAVE,
    },
    addresses: {
      GOVERNANCE_CORE: GovernanceV3Arbitrum.PAYLOADS_CONTROLLER,
      GOVERNANCE_DATA_HELPER: '',
      WALLET_BALANCE_PROVIDER: AaveV3Arbitrum.WALLET_BALANCE_PROVIDER,
      GOVERNANCE_META_HELPER: '',
      TOKEN_POWER_HELPER: '0xBb7baf0534423e3108E1D03c259104cDba2C1cB7',
    },
  },
};

const coreNetwork = ChainId.arbitrum_one;
export const governanceV3Config = governanceChainConfig[coreNetwork];
