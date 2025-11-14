import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { GENERAL } from 'src/utils/events';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { ChangeNetworkWarning } from '../../Warnings/ChangeNetworkWarning';
import { SwapParams, SwapState } from '../types';

export function SwapNetworkWarning({ state }: { state: SwapState; params: SwapParams }) {
  const isWrongNetwork = useIsWrongNetwork(state.chainId);
  const { readOnlyModeAddress } = useWeb3Context();

  if (!isWrongNetwork.isWrongNetwork || readOnlyModeAddress) {
    return null;
  }

  return (
    <ChangeNetworkWarning
      autoSwitchOnMount={true}
      networkName={getNetworkConfig(state.chainId).name}
      chainId={state.chainId}
      event={{
        eventName: GENERAL.SWITCH_NETWORK,
      }}
      askManualSwitch={state.userIsSmartContractWallet}
    />
  );
}
