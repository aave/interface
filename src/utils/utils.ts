import { ChainId } from '@aave/contract-helpers';
import { BigNumberValue, USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';

export function hexToAscii(_hex: string): string {
  const hex = _hex.toString();
  let str = '';
  for (let n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
}

export interface CancelablePromise<T = unknown> {
  promise: Promise<T>;
  cancel: () => void;
}

export const makeCancelable = <T>(promise: Promise<T>) => {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise.then(
      (val) => (hasCanceled_ ? reject({ isCanceled: true }) : resolve(val)),
      (error) => (hasCanceled_ ? reject({ isCanceled: true }) : reject(error))
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    },
  };
};

export const optimizedPath = (currentChainId: ChainId) => {
  return (
    currentChainId === ChainId.arbitrum_one ||
    currentChainId === ChainId.arbitrum_rinkeby ||
    currentChainId === ChainId.optimism
    // ||
    // currentChainId === ChainId.optimism_kovan
  );
};

// Overrides for minimum base token remaining after performing an action
export const minBaseTokenRemainingByNetwork: Record<number, string> = {
  [ChainId.optimism]: '0.0001',
  [ChainId.arbitrum_one]: '0.0001',
};

export const amountToUsd = (
  amount: BigNumberValue,
  formattedPriceInMarketReferenceCurrency: string,
  marketReferencePriceInUsd: string
) => {
  return valueToBigNumber(amount)
    .multipliedBy(formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS);
};

export const roundToTokenDecimals = (inputValue: string, tokenDecimals: number) => {
  const [whole, decimals] = inputValue.split('.');

  // If there are no decimal places or the number of decimal places is within the limit
  if (!decimals || decimals.length <= tokenDecimals) {
    return inputValue;
  }

  // Truncate the decimals to the specified number of token decimals
  const adjustedDecimals = decimals.slice(0, tokenDecimals);

  // Combine the whole and adjusted decimal parts
  return whole + '.' + adjustedDecimals;
};
