import { TxModalTitle } from '../../FlowCommons/TxModalTitle';
import { SwapParams, SwapState } from '../types';

export const SwapModalTitle = ({ params, state }: { params: SwapParams; state: SwapState }) => {
  return (
    <TxModalTitle
      title={`Swap ${state?.sourceToken?.symbol ? state.sourceToken.symbol : 'Assets'} ${
        params.titleTokenPostfix ?? ''
      }`}
    />
  );
};
