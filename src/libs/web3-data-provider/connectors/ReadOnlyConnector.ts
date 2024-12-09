import { ChainId } from '@aave/contract-helpers';
import { initializeConnector } from '@web3-react/core';
import { Actions, Connector, Provider } from '@web3-react/types';

export class MockProvider implements Provider {
  request() {
    return Promise.resolve(null);
  }
  on() {
    return this;
  }
  removeListener() {
    return this;
  }
}

export class ReadOnly extends Connector {
  private readAddress = '';
  provider: MockProvider;

  constructor({ actions, onError }: { actions: Actions; onError?: (error: Error) => void }) {
    super(actions, onError);
    this.provider = new MockProvider();
  }

  async activate(): Promise<void> {
    const address = localStorage.getItem('readOnlyModeAddress');
    if (!address || address === 'undefined') {
      throw new Error('No address found in local storage for read-only mode');
    }

    this.readAddress = address;
    const cancelActivation = this.actions.startActivation();

    try {
      this.actions.update({ chainId: ChainId.mainnet, accounts: [this.readAddress] });
    } catch (error) {
      cancelActivation();
      throw error;
    }
  }

  deactivate(): void {
    const storedReadAddress = localStorage.getItem('readOnlyModeAddress');
    if (storedReadAddress === this.readAddress) {
      localStorage.removeItem('readOnlyModeAddress');
    }
    this.actions.resetState();
  }

  connectEagerly(): void {
    return;
  }
}

export const [readOnly, hooks] = initializeConnector<ReadOnly>(
  (actions) => new ReadOnly({ actions })
);
