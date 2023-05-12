import { ReactElement } from 'react-markdown/lib/react-markdown';
import { TxErrorView } from 'src/components/transactions/FlowCommons/Error';
import { TxSuccessView } from 'src/components/transactions/FlowCommons/Success';
import { TxModalTitle } from 'src/components/transactions/FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from 'src/components/transactions/Warnings/ChangeNetworkWarning';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useModalContext } from 'src/hooks/useModal';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

export interface ManekiModalChildProps {
  symbol: string;
  isWrongNetwork: boolean;
}

interface ManekiModalWrapperProps {
  title: ReactElement;
  requiredChainId?: number;
  symbol: string;
  children: (props: ManekiModalChildProps) => React.ReactNode;
}

export const ManekiModalWrapper = ({
  title,
  requiredChainId: _requiredChainId,
  symbol,
  children,
}: ManekiModalWrapperProps) => {
  const { txError, mainTxState } = useModalContext();
  const { isWrongNetwork, requiredChainId } = useIsWrongNetwork(_requiredChainId);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }

  if (mainTxState.success) {
    return <TxSuccessView />;
  }

  return (
    <>
      <TxModalTitle title={title} symbol={symbol} />
      {isWrongNetwork && (
        <ChangeNetworkWarning
          networkName={getNetworkConfig(requiredChainId).name}
          chainId={requiredChainId}
        />
      )}
      {children({
        symbol,
        isWrongNetwork,
      })}
    </>
  );
};
