import { SwapError, SwapState } from '../../types';

function serializeError(raw: unknown) {
  if (!raw) return undefined;
  try {
    const err = raw as Record<string, unknown>;
    const base: Record<string, unknown> = {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
    };
    const props: Record<string, unknown> = {};
    try {
      for (const key of Object.getOwnPropertyNames(err)) {
        if (!(key in base)) props[key] = err[key];
      }
    } catch (_) {
      // ignore
    }
    return { ...base, ...props };
  } catch (_) {
    return { message: String(raw) };
  }
}

function buildErrorPayload(state: SwapState, error: SwapError) {
  return {
    timestamp: new Date().toISOString(),
    chainId: state.chainId,
    provider: state.provider,
    useFlashloan: state.useFlashloan ?? false,
    side: state.side,
    orderType: state.orderType,
    slippage: state.slippage,
    input: {
      token: state.sourceToken.symbol,
      amount: state.inputAmount,
      usd: state.swapRate?.srcSpotUSD,
    },
    output: {
      token: state.destinationToken.symbol,
      amount: state.outputAmount,
      usd: state.swapRate?.destSpotUSD,
    },
    error: {
      message: error.message,
      actionBlocked: error.actionBlocked,
      stage: error.stage,
      raw: serializeError(error.rawError),
    },
  };
}

export const errorToConsoleString = (state: SwapState, error: SwapError): string => {
  const payload = buildErrorPayload(state, error);
  return JSON.stringify(payload, null, 2);
};

export const errorToConsole = (state: SwapState, error: SwapError) => {
  const pretty = errorToConsoleString(state, error);
  console.error('Aave Swap Error\n' + pretty);
};
