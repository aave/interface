// This is a copy of the original file from web3-react.
// The reason is because the original package is exported only as a CJS module, which uses gnosis safe sdk, which uses viem.
// So the full viem package is included in the bundle, which makes the export 100kb bigger (since we use ethers).

import type { SafeAppProvider } from '@safe-global/safe-apps-provider';
import type SafeAppsSDK from '@safe-global/safe-apps-sdk';
import type { Opts } from '@safe-global/safe-apps-sdk';
import { initializeConnector } from '@web3-react/core';
import type { Actions } from '@web3-react/types';
import { Connector } from '@web3-react/types';

export class NoSafeContext extends Error {
  public constructor() {
    super('The app is loaded outside safe context');
    this.name = NoSafeContext.name;
    Object.setPrototypeOf(this, NoSafeContext.prototype);
  }
}

export interface GnosisSafeConstructorArgs {
  actions: Actions;
  options?: Opts;
}

export class GnosisSafe extends Connector {
  public provider?: SafeAppProvider;

  private readonly options?: Opts;
  private eagerConnection?: Promise<void>;

  public sdk: SafeAppsSDK | undefined;

  constructor({ actions, options }: GnosisSafeConstructorArgs) {
    super(actions);
    this.options = options;
  }

  private get serverSide() {
    return typeof window === 'undefined';
  }

  private get inIframe() {
    if (this.serverSide) return false;
    if (window !== window.parent) return true;
    return false;
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return;

    const SafeAppProviderPromise = import('@safe-global/safe-apps-provider').then(
      ({ SafeAppProvider }) => SafeAppProvider
    );

    await (this.eagerConnection = import('@safe-global/safe-apps-sdk').then(async (m) => {
      this.sdk = new m.default(this.options);

      const safe = await Promise.race([
        this.sdk.safe.getInfo(),
        new Promise<undefined>((resolve) => setTimeout(resolve, 500)),
      ]);

      if (safe) {
        const SafeAppProvider = await SafeAppProviderPromise;
        this.provider = new SafeAppProvider(safe, this.sdk);
      }
    }));
  }

  public async connectEagerly(): Promise<void> {
    if (!this.inIframe) return;

    const cancelActivation = this.actions.startActivation();

    try {
      await this.isomorphicInitialize();
      if (!this.provider) throw new NoSafeContext();

      this.actions.update({
        chainId: this.provider.chainId,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        accounts: [await this.sdk!.safe.getInfo().then(({ safeAddress }) => safeAddress)],
      });
    } catch (error) {
      cancelActivation();
      throw error;
    }
  }

  public async activate(): Promise<void> {
    if (!this.inIframe) throw new NoSafeContext();

    let cancelActivation: () => void;
    if (!this.sdk) cancelActivation = this.actions.startActivation();

    return this.isomorphicInitialize()
      .then(async () => {
        if (!this.provider) throw new NoSafeContext();

        this.actions.update({
          chainId: this.provider.chainId,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          accounts: [await this.sdk!.safe.getInfo().then(({ safeAddress }) => safeAddress)],
        });
      })
      .catch((error) => {
        cancelActivation?.();
        throw error;
      });
  }
}

export const [gnosisSafe, hooks] = initializeConnector<GnosisSafe>(
  (actions) => new GnosisSafe({ actions })
);
