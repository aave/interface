import { ChainId } from '@aave/contract-helpers';

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
  stkAaveTokenAddress: '0x4da27a545c0c5b758a6ba100e3a049001de870f5',
  governanceForumLink: 'https://governance.aave.com',
  governanceFAQLink: 'https://docs.aave.com/faq/governance',
  walletBalanceProvider: '0x8E8dAd5409E0263a51C0aB5055dA66Be28cFF922',
  governanceSnapshotLink: 'https://snapshot.org/#/aave.eth',
  addresses: {
    AAVE_GOVERNANCE_V2: '0xEC568fffba86c094cf06b22134B23074DFE2252c',
    AAVE_GOVERNANCE_V2_EXECUTOR_SHORT: '0x61910EcD7e8e942136CE7Fe7943f956cea1CC2f7',
    AAVE_GOVERNANCE_V2_EXECUTOR_LONG: '0xEE56e2B3D491590B5b31738cC34d5232F378a8D5',
    AAVE_GOVERNANCE_V2_HELPER: '0xBb7baf0534423e3108E1D03c259104cDba2C1cB7',
  },
  ipfsGateway: 'https://cloudflare-ipfs.com/ipfs',
  fallbackIpfsGateway: 'https://ipfs.io/ipfs',
};

export const votingChainIds = [ChainId.sepolia, ChainId.fuji] as const;
export type VotingChain = typeof votingChainIds[number];

export interface VotingMachineConfig {
  portalToMachineMap: { [votingPoralAddress: string]: string };
  votingPortalDataHelperAddress: string;
  votingMachineAddress: string;
}

export interface GovernanceV3Config {
  coreChainId: ChainId;
  votingMachineSubgraphUrl: string;
  governanceCoreSubgraphUrl: string;
  votingChainConfig: { [key in VotingChain]: VotingMachineConfig };
  addresses: {
    GOVERNANCE_CORE: string;
    GOVERNANCE_DATA_HELPER: string;
  };
  votingAssets: string[];
}

const sepoliaVotingMachineConfig: VotingMachineConfig = {
  portalToMachineMap: {
    '0x1079bAa48E56065d43b4344866B187a485cb0A92': '0xA1995F1d5A8A247c064a76F336E1C2ecD24Ef0D9',
  },
  votingPortalDataHelperAddress: '0x133210F3fe2deEB34e65deB6861ee3dF87393977',
  votingMachineAddress: '0xA1995F1d5A8A247c064a76F336E1C2ecD24Ef0D9',
};

const fujiVotingMachineConfig: VotingMachineConfig = {
  portalToMachineMap: {
    '0x4f47EdF2577995aBd7B875Eed75b3F28a20E696F': '0x767AA57554690D23D1E0594E8746271C97e1A1e4',
  },
  votingPortalDataHelperAddress: '0x133210F3fe2deEB34e65deB6861ee3dF87393977',
  votingMachineAddress: '0x767AA57554690D23D1E0594E8746271C97e1A1e4',
};

export const governanceV3Config: GovernanceV3Config = {
  coreChainId: ChainId.sepolia,
  votingMachineSubgraphUrl:
    'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/votingmachine-sepolia-avalanche-testnet/v2/gn',
  governanceCoreSubgraphUrl:
    'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/governance-v3/v2.0.1/gn',
  votingChainConfig: {
    [ChainId.sepolia]: sepoliaVotingMachineConfig,
    [ChainId.fuji]: fujiVotingMachineConfig,
  },
  votingAssets: [
    // TODO: could query the contracts for list of voting assets
    '0xdaEcee477B931b209e8123401EA37582ACB3811d',
    '0x354032B31339853A3D682613749F183328d07275',
    '0x26aAB2aE39897338c2d91491C46c14a8c2a67919',
  ],
  addresses: {
    GOVERNANCE_CORE: '0xc4ABF658C3Dda84225cF8A07d7D5Bb6Aa41d9E59',
    GOVERNANCE_DATA_HELPER: '0x863f9De2f82AB502612E8B7d4f4863c8535cb8cA',
  },
};
