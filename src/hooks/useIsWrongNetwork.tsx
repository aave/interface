import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { useProtocolDataContext } from './useProtocolDataContext';

export function useIsWrongNetwork(_requiredChainId?: number) {
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  const requiredChainId = _requiredChainId ? _requiredChainId : currentChainId;
  const isWrongNetwork = connectedChainId !== requiredChainId;

  return {
    isWrongNetwork,
    requiredChainId,
  };
}
