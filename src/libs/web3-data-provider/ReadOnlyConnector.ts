import { ChainId } from '@aave/contract-helpers';
import { MockConnector } from '@wagmi/connectors/mock';
import { createWalletClient, custom } from 'viem';
import { Chain, Connector, mainnet } from 'wagmi';

interface ReadOnlyConnectorOptions {
  address: `0x${string}`;
}

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

export class ReadOnlyConnector extends Connector<undefined, ReadOnlyConnectorOptions> {
  readonly id = 'readOnlyConnector';
  readonly name = 'Read Only Connector';
  readonly ready = true;
  private readonly address: `0x${string}`;

  constructor({ chains, options }: { chains?: Chain[]; options: ReadOnlyConnectorOptions }) {
    super({
      chains,
      options,
    });
    this.address = options.address;
  }

  async connect() {
    return Promise.resolve({
      account: this.address,
      chain: {
        id: ChainId.mainnet,
        unsupported: false,
      },
    });
  }
  disconnect() {
    return Promise.resolve();
  }
  getAccount() {
    return Promise.resolve(this.address);
  }
  getChainId() {
    return Promise.resolve(ChainId.mainnet);
  }
  getProvider() {
    return Promise.resolve(undefined);
  }
  getWalletClient() {
    return Promise.resolve(
      createWalletClient({
        account: this.address,
        transport: custom({
          async request() {
            return Promise.resolve();
          },
        }),
        chain: mainnet,
      })
    );
  }
  isAuthorized() {
    return Promise.resolve(false);
  }
  protected onAccountsChanged() {}
  protected onChainChanged() {}
  protected onDisconnect() {}
  protected getBlockExplorerUrls() {
    return [];
  }
  protected isChainUnsupported() {
    return false;
  }
}
