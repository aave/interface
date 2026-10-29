import { wallets } from 'connectkit';
import type { CreateConnectorFn } from 'wagmi';

/** Oath is a native iOS entry; the existing WalletConnect connector owns the session. */
export function withOathWallet(
  connectors: readonly CreateConnectorFn[] | undefined,
  config: Parameters<CreateConnectorFn>[0]
): readonly CreateConnectorFn[] | undefined {
  if (!connectors || connectors.some((connector) => connector(config).id === 'oath')) {
    return connectors;
  }

  // Do not offer a QR-only wallet when WalletConnect is not configured.
  return connectors.flatMap((connector) =>
    connector(config).id === 'walletConnect' ? [wallets.oathWallet, connector] : [connector]
  );
}
