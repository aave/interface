import { useWeb3React } from '@web3-react/core';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

export default function useIsAmbireWC(): boolean {
  const res = useWeb3React();
  const wcConnector = res?.connector as WalletConnectConnector;
  return (
    wcConnector?.walletConnectProvider?.signer?.connection?.wc?._peerMeta?.name === 'Ambire Wallet'
  );
}
