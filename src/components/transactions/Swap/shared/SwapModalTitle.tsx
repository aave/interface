import { TxModalTitle } from '../../FlowCommons/TxModalTitle';
import { SwapParams, SwapState, SwapType } from '../types';

export const SwapModalTitle = ({ params, state }: { params: SwapParams; state: SwapState }) => {
  const verb = params.swapType === SwapType.Leverage ? 'Leverage' : 'Swap';

  return (
    <TxModalTitle
      title={`${verb} ${state?.sourceToken?.symbol ? state.sourceToken.symbol : 'Assets'} ${
        params.titleTokenPostfix ?? ''
      }`}
    />
  );
};
