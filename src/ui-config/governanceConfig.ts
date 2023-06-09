import { ChainId } from '@aave/contract-helpers';
import { AaveGovernanceV2, AaveSafetyModule } from '@bgd-labs/aave-address-book';

export interface GovernanceConfig {
  chainId: ChainId;
  walletBalanceProvider: string;
  votingAssetName: string;
  averageNetworkBlockTime: number;
  queryGovernanceDataUrl: string;
  wsGovernanceDataUrl: string;
  aaveTokenAddress: string;
  aAaveTokenAddress: string;
  stkAaveTokenAddress: string;
  governanceForumLink: string;
  governanceSnapshotLink: string;
  governanceFAQLink: string;
  addresses: {
    AAVE_GOVERNANCE_V2: string;
    AAVE_GOVERNANCE_V2_EXECUTOR_SHORT: string;
    AAVE_GOVERNANCE_V2_EXECUTOR_LONG: string;
    AAVE_GOVERNANCE_V2_HELPER: string;
    AAVE_GOVERNANCE_V2_CROSSCHAIN_FORWARDER_ARBITRUM: string;
    AAVE_GOVERNANCE_V2_CROSSCHAIN_FORWARDER_OPTIMISM: string;
    AAVE_GOVERNANCE_V2_CROSSCHAIN_FORWARDER_POLYGON: string;
    AAVE_GOVERNANCE_V2_CROSSCHAIN_FORWARDER_METIS: string;
  };
  ipfsGateway: string;
  fallbackIpfsGateway: string;
}

export const governanceConfig: GovernanceConfig = {
  chainId: ChainId.mainnet,
  votingAssetName: 'AAVE + stkAAVE',
  averageNetworkBlockTime: 13.5,
  queryGovernanceDataUrl: 'https://api.thegraph.com/subgraphs/name/aave/governance-v2',
  wsGovernanceDataUrl: 'wss://api.thegraph.com/subgraphs/name/aave/governance-v2',
  aaveTokenAddress: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
  aAaveTokenAddress: '0xDa5E8e1C3596D3Cc11a4dd5aD66b8f03B5410F8C',
  stkAaveTokenAddress: AaveSafetyModule.STK_AAVE,
  governanceForumLink: 'https://governance.aave.com',
  governanceFAQLink: 'https://docs.aave.com/faq/governance',
  walletBalanceProvider: '0x8E8dAd5409E0263a51C0aB5055dA66Be28cFF922',
  governanceSnapshotLink: 'https://snapshot.org/#/aave.eth',
  addresses: {
    AAVE_GOVERNANCE_V2: AaveGovernanceV2.GOV,
    AAVE_GOVERNANCE_V2_EXECUTOR_SHORT: AaveGovernanceV2.SHORT_EXECUTOR,
    AAVE_GOVERNANCE_V2_EXECUTOR_LONG: AaveGovernanceV2.LONG_EXECUTOR,
    AAVE_GOVERNANCE_V2_HELPER: '0xBb7baf0534423e3108E1D03c259104cDba2C1cB7', // TODO: add to address book
    AAVE_GOVERNANCE_V2_CROSSCHAIN_FORWARDER_ARBITRUM:
      AaveGovernanceV2.CROSSCHAIN_FORWARDER_ARBITRUM,
    AAVE_GOVERNANCE_V2_CROSSCHAIN_FORWARDER_OPTIMISM:
      AaveGovernanceV2.CROSSCHAIN_FORWARDER_OPTIMISM,
    AAVE_GOVERNANCE_V2_CROSSCHAIN_FORWARDER_POLYGON: AaveGovernanceV2.CROSSCHAIN_FORWARDER_POLYGON,
    AAVE_GOVERNANCE_V2_CROSSCHAIN_FORWARDER_METIS: AaveGovernanceV2.CROSSCHAIN_FORWARDER_METIS,
  },
  ipfsGateway: 'https://cloudflare-ipfs.com/ipfs',
  fallbackIpfsGateway: 'https://ipfs.io/ipfs',
};
