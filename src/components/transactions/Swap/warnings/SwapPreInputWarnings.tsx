import { SwapParams, SwapState } from '../types';
import { CowOpenOrdersWarning } from './preInputs';
import { SwapNetworkWarning } from './SwapNetworkWarning';

export const SwapPreInputWarnings = ({
  params,
  state,
}: {
  params: SwapParams;
  state: SwapState;
}) => {
  return (
    <>
      <SwapNetworkWarning state={state} params={params} />

      <CowOpenOrdersWarning state={state} />
    </>
  );
};
