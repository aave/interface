import { ChainId } from '@aave/contract-helpers';
import { initializeConnector } from '@web3-react/core';
import { Actions, Connector, Provider } from '@web3-react/types';

export class MockProvider implements Provider {
  request() {
    return Promise.resolve();
  }
  on() {
    return this;
  }
  removeListener() {
    return this;
  }
}

interface ReadOnlyConnectorConstructorArgs {
  actions: Actions;
}

export class ReadOnlyConnector extends Connector {
  constructor({ actions }: ReadOnlyConnectorConstructorArgs) {
    super(actions);
  }

  async activate(address: string): Promise<void> {
    this.actions.startActivation();
    const accounts = [address];
    localStorage.setItem('readOnlyModeAddress', address);
    this.actions.update({ chainId: ChainId.mainnet, accounts });
  }

  connectEagerly(): void | Promise<void> {
    const address = localStorage.getItem('readOnlyModeAddress');
    if (!address) return;
    this.activate(address);
  }

  deactivate(): void | Promise<void> {
    localStorage.removeItem('readOnlyModeAddress');
  }
}

export const [readOnly, hooks] = initializeConnector<ReadOnlyConnector>(
  (actions) => new ReadOnlyConnector({ actions })
);
