import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { GovRepresentativesActions } from './GovRepresentativesActions';

export const GovRepresentativesContent = () => {
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const [currentNetworkConfig, currentChainId] = useRootStore((state) => [
    state.currentNetworkConfig,
    state.currentChainId,
  ]);

  // is Network mismatched
  const govChain =
    currentNetworkConfig.isFork &&
    currentNetworkConfig.underlyingChainId === governanceConfig.chainId
      ? currentChainId
      : governanceConfig.chainId;
  const isWrongNetwork = connectedChainId !== govChain;

  const networkConfig = getNetworkConfig(govChain);

  return (
    <>
      <TxModalTitle title="Link address" />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={govChain} />
      )}
      <GovRepresentativesActions blocked={false} isWrongNetwork={false} />
    </>
  );
};
