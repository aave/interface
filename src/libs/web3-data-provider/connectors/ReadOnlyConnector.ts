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

export class ReadOnly extends Connector {
  constructor({ actions }: ReadOnlyConnectorConstructorArgs) {
    super(actions);
  }

  async activate(address: string): Promise<void> {
    this.actions.startActivation();
    const accounts = [address];
    this.actions.update({ chainId: ChainId.mainnet, accounts });
  }
}

export const [readOnly, hooks] = initializeConnector<ReadOnly>(
  (actions) => new ReadOnly({ actions })
);
