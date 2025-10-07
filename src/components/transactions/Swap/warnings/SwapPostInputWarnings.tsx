import { Box } from '@mui/material';
import React, { Dispatch } from 'react';

import { SwapParams, SwapState } from '../types';
import {
  CustomTokenWarning,
  HighPriceImpactWarning,
  LimitOrderAmountWarning,
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
  // If errors, we don't show warnings as those have priority and are action blockers
  if (state.error) {
    return null;
  }

  return (
    <Box sx={{ mt: 6, mb: 2 }}>
      <CustomTokenWarning state={state} />
      <SlippageWarning state={state} />
      <USDTResetWarning state={state} />
      <LiquidationCriticalWarning params={params} state={state} setState={setState} />
      <LowHealthFactorWarning params={params} state={state} setState={setState} />
      <HighPriceImpactWarning state={state} setState={setState} />
      <LimitOrderAmountWarning state={state} />
      <SafetyModuleSwapWarning state={state} />
    </Box>
  );
};
