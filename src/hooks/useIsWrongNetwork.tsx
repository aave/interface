import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

export function useIsWrongNetwork(_requiredChainId?: number) {
  const currentChainId = useRootStore((store) => store.currentChainId);
  const { chainId: connectedChainId } = useWeb3Context();

  const requiredChainId = _requiredChainId ? _requiredChainId : currentChainId;

  const isWrongNetwork = connectedChainId !== requiredChainId;

  return {
    isWrongNetwork,
    requiredChainId,
  };
}
