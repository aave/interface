import { ChainId } from '@aave/contract-helpers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';

import { CustomizedBridge } from '../tools/bridge';
import { DEFAULT_TEST_ACCOUNT, TenderlyFork } from '../tools/tenderly';

const URL = Cypress.env('URL');
const PERSIST_FORK_AFTER_RUN = Cypress.env('PERSIST_FORK_AFTER_RUN') || false;

export const configEnvWithTenderly = ({
  chainId,
  market,
  tokens,
  unpause,
  wallet,
  enableTestnet = false,
}: {
  chainId: number;
  market: string;
  tokens?: { tokenAddress: string; donorAddress?: string; tokenCount?: string }[];
  unpause?: boolean;
  wallet?: { address: string; privateKey: string };
  enableTestnet?: boolean;
}) => {
  const tenderly = new TenderlyFork({ forkNetworkID: chainId });
  const walletAddress: string = wallet != null ? wallet.address : DEFAULT_TEST_ACCOUNT.address;
  const privateKey: string = wallet != null ? wallet.privateKey : DEFAULT_TEST_ACCOUNT.privateKey;
  let provider: JsonRpcProvider;
  let signer: Wallet;
  let auth: Cypress.AUTWindow;
  before(async () => {
    await tenderly.init();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await setTimeout(() => {}, 3000);

    await tenderly.add_balance_rpc(walletAddress);
    if (unpause) {
      await tenderly.unpauseMarket();
    }

    if (tokens) {
      await Promise.all(
        tokens.map((token) =>
          tenderly.getERC20Token(
            walletAddress,
            token.tokenAddress,
            token.donorAddress,
            token.tokenCount
          )
        )
      );
    }
  });
  before('Open main page', () => {
    const rpc = tenderly.get_rpc_url();
    provider = new JsonRpcProvider(rpc, 3030);
    signer = new Wallet(privateKey, provider);
    cy.visit(URL, {
      onBeforeLoad(win) {
        // eslint-disable-next-line
        (win as any).ethereum = new CustomizedBridge(signer, provider);
        auth = win;
        win.localStorage.setItem('forkEnabled', 'true');
        // forks are always expected to run on chainId 3030
        win.localStorage.setItem('forkNetworkId', '3030');
        win.localStorage.setItem('forkBaseChainId', chainId.toString());
        win.localStorage.setItem('forkRPCUrl', rpc);
        win.localStorage.setItem('walletProvider', 'injected');
        win.localStorage.setItem('selectedAccount', walletAddress.toLowerCase());
        win.localStorage.setItem('selectedMarket', market);
        win.localStorage.setItem('testnetsEnabled', enableTestnet.toString());
      },
    });
  });
  before('Save env variables', () => {
    window.tenderly = tenderly;
    window.address = walletAddress;
    window.chainId = chainId.toString();
    window.rpc = tenderly.get_rpc_url();
    window.market = market;
    window.testnetsEnabled = enableTestnet.toString();
    window.url = URL;
    window.privateKey = privateKey;
    window.provider = provider;
    window.signer = signer;
    window.auth = auth;
  });
  after(async () => {
    if (!PERSIST_FORK_AFTER_RUN) {
      cy.log('deleting fork');
      await tenderly.deleteFork();
    }
  });
};

export const configEnvWithTenderlyMainnetFork = ({
  market = `fork_proto_mainnet`,
  tokens,
  v3,
  wallet,
}: {
  market?: string;
  tokens?: { tokenAddress: string }[];
  v3?: boolean;
  wallet?: { address: string; privateKey: string };
}) => {
  configEnvWithTenderly({ chainId: ChainId.mainnet, market, tokens, unpause: v3, wallet });
};

export const configEnvWithTenderlyPolygonFork = ({
  market = `fork_proto_polygon`,
  tokens,
  v3,
}: {
  market?: string;
  tokens?: { tokenAddress: string }[];
  v3?: boolean;
}) => {
  configEnvWithTenderly({ chainId: ChainId.polygon, market, tokens, unpause: v3 });
};

export const configEnvWithTenderlyAvalancheFork = ({
  market = `fork_proto_avalanche`,
  tokens,
  v3,
}: {
  market?: string;
  tokens?: { tokenAddress: string }[];
  v3?: boolean;
}) => {
  configEnvWithTenderly({ chainId: ChainId.avalanche, market, tokens, unpause: v3 });
};

export const configEnvWithTenderlyAvalancheFujiFork = ({
  market = `proto_fuji_v3`,
  tokens,
  v3,
}: {
  market?: string;
  tokens?: { tokenAddress: string }[];
  v3?: boolean;
}) => {
  configEnvWithTenderly({ chainId: ChainId.fuji, market, tokens, unpause: v3 });
};

export const configEnvWithTenderlyOptimismFork = ({
  market = `fork_proto_optimism_v3`,
  tokens,
  v3,
}: {
  market?: string;
  tokens?: { tokenAddress: string }[];
  v3?: boolean;
}) => {
  configEnvWithTenderly({ chainId: ChainId.optimism, market, tokens, unpause: v3 });
};

export const configEnvWithTenderlyFantomFork = ({
  market = `fork_proto_fantom_v3`,
  tokens,
  v3,
}: {
  market?: string;
  tokens?: { tokenAddress: string }[];
  v3?: boolean;
}) => {
  configEnvWithTenderly({ chainId: ChainId.fantom, market, tokens, unpause: v3 });
};

export const configEnvWithTenderlyArbitrumFork = ({
  market = `fork_proto_arbitrum_v3`,
  tokens,
  v3,
}: {
  market?: string;
  tokens?: { tokenAddress: string }[];
  v3?: boolean;
}) => {
  configEnvWithTenderly({ chainId: ChainId.arbitrum_one, market, tokens, unpause: v3 });
};

export const configEnvWithTenderlyAEthereumV3Fork = ({
  market = `fork_proto_mainnet_v3`,
  tokens,
  v3,
}: {
  market?: string;
  tokens?: { tokenAddress: string }[];
  v3?: boolean;
}) => {
  configEnvWithTenderly({ chainId: ChainId.mainnet, market, tokens, unpause: v3 });
};

export const configEnvWithTenderlyGoerliGhoFork = ({
  market = `fork_proto_goerli_gho_v3`,
  tokens,
  v3,
}: {
  market?: string;
  tokens?: { tokenAddress: string; donorAddress?: string; tokenCount?: string }[];
  v3?: boolean;
}) => {
  configEnvWithTenderly({
    chainId: ChainId.goerli,
    market,
    tokens,
    unpause: v3,
    enableTestnet: true,
  });
};
