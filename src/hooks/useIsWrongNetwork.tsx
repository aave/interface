import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { isSimulatedWalletAddress } from 'src/modules/dynamic-caps/simulatedWallet';
import { useRootStore } from 'src/store/root';

export function useIsWrongNetwork(_requiredChainId?: number) {
  const currentChainId = useRootStore((store) => store.currentChainId);
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();

  const requiredChainId = _requiredChainId ? _requiredChainId : currentChainId;

  // PREVIEW ONLY: a simulated wallet is on no network; treat it as being on the required one, so
  // the flows read as they do for a connected wallet.
  const isWrongNetwork =
    connectedChainId !== requiredChainId && !isSimulatedWalletAddress(readOnlyModeAddress);

  return {
    isWrongNetwork,
    requiredChainId,
  };
}
