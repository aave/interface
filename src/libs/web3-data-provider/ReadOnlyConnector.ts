import { ChainId } from '@aave/contract-helpers';
import { MockConnector } from '@wagmi/connectors/mock';
import invariant from 'tiny-invariant';
import { createWalletClient, custom } from 'viem';
import { Chain, Connector, mainnet } from 'wagmi';

export const createReadOnlyConnector = (address: `0x${string}`) => {
  return new MockConnector({
    options: {
      walletClient: createWalletClient({
        account: address,
        transport: custom({
          async request() {
            return Promise.resolve();
          },
        }),
      }),
    },
  });
};

export const READ_ONLY_CONNECTOR_ID = 'readOnlyConnector';

export class ReadOnlyConnector extends Connector<undefined, undefined> {
  readonly id = READ_ONLY_CONNECTOR_ID;
  readonly name = 'Read Only Connector';
  readonly ready = true;

  constructor({ chains }: { chains?: Chain[] } = {}) {
    super({
      chains,
      options: undefined,
    });
  }

  async connect() {
    const address = await this.getAccount();
    invariant(address, 'Failed to fetch address from local storage');
    return {
      account: address,
      chain: {
        id: ChainId.mainnet,
        unsupported: false,
      },
    };
  }
  disconnect() {
    window.localStorage.removeItem('readOnlyModeAddress');
    return Promise.resolve();
  }
  getAccount() {
    const address = localStorage.getItem('readOnlyModeAddress') as `0x${string}`;
    invariant(address, 'Failed to fetch address from local storage');
    return Promise.resolve(address);
  }
  getChainId() {
    return Promise.resolve(ChainId.mainnet);
  }
  getProvider() {
    return Promise.resolve(undefined);
  }
  async getWalletClient() {
    const address = await this.getAccount();
    return createWalletClient({
      account: address,
      transport: custom({
        async request() {
          return Promise.resolve();
        },
      }),
      chain: mainnet,
    });
  }
  async isAuthorized() {
    return !!localStorage.getItem('readOnlyModeAddress');
  }
  protected onAccountsChanged() {
    return;
  }
  protected onChainChanged() {
    return;
  }
  protected onDisconnect() {
    return;
  }
  protected getBlockExplorerUrls() {
    return [];
  }
  protected isChainUnsupported() {
    return false;
  }
}
