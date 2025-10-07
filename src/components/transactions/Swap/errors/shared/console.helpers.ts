import { TxErrorType } from 'src/ui-config/errorMapping';

import { SwapState } from '../../types';

export const errorToConsole = (state: SwapState, txError: TxErrorType) => {
  // Enhanced error logging with formatting, coloring and JSON
  // Use %c (CSS) for color in modern browsers
  const errorInfo = {
    errorMessage: txError.error,
    errorRaw: txError.rawError,
    errorAction: txError.txAction,
    inputToken: state.sourceToken.symbol,
    outputToken: state.destinationToken.symbol,
    inputAmount: state.debouncedInputAmount,
    outputAmount: state.debouncedOutputAmount,
    slippage: state.slippage,
    provider: state.swapRate?.provider,
    inputAmountUsd: state.swapRate?.srcUSD,
    outputAmountUsd: state.swapRate?.destUSD,
    chainId: state.chainId,
    side: state.side,
    orderType: state.orderType,
  };

  // Compose readable message with color
  const titleStyle = 'color: #d7263d; font-weight: bold; font-size: 1.2em';
  const sectionStyle = 'color: #1976d2; font-weight: bold;';
  const valueStyle = 'color: #222;';

  console.groupCollapsed('%cAave Swap Error 👻', titleStyle);
  console.error(
    '%cIf you are seeing this error, please share the below with the team via our support channels.\nThank you! The Aave team 👻',
    valueStyle
  );
  console.log('%cError Summary:', sectionStyle);
  console.log('%c' + JSON.stringify(errorInfo, null, 2), valueStyle);

  if (txError.rawError) {
    console.log('%cRaw Error Object:', sectionStyle);
    try {
      // Try to output the raw error as json if possible
      console.dir(txError.rawError);
    } catch (e) {
      console.log(txError.rawError);
    }
  }
  console.groupEnd();
};
