import React, { Dispatch } from 'react';

import { SwapParams, SwapState } from '../types';
import {
  CustomTokenWarning,
  HighPriceImpactWarning,
  LiquidationCriticalWarning,
  LowHealthFactorWarning,
  SafetyModuleSwapWarning,
  SlippageWarning,
  USDTResetWarning,
} from './postInputs';

export const SwapPostInputWarnings = ({
  params,
  state,
  setState,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) => {
  return (
    <>
      <CustomTokenWarning state={state} />
      <SlippageWarning state={state} />
      <USDTResetWarning state={state} />
      <LiquidationCriticalWarning params={params} state={state} />
      <LowHealthFactorWarning params={params} state={state} setState={setState} />
      <HighPriceImpactWarning state={state} setState={setState} />
      <SafetyModuleSwapWarning state={state} />
    </>
  );
};
