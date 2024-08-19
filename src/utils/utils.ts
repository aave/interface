import { ChainId } from '@aave/contract-helpers';
import { BigNumberValue, USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';

import { CustomMarket } from './marketsAndNetworksConfig';

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
    currentChainId === ChainId.arbitrum_one || currentChainId === ChainId.optimism
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
export enum Side {
  SUPPLY = 'supply',
  BORROW = 'borrow',
}
export const showSuperFestTooltip = (symbol: string, currentMarket: string, side?: Side) => {
  return (
    currentMarket === CustomMarket.proto_base_v3 &&
    ((side === Side.SUPPLY && symbol == 'weETH') ||
      (side === Side.BORROW && (symbol == 'USDC' || symbol == 'ETH')))
  );
};

export function withOpacity(color: string, opacity: number): string {
  // Helper function to convert a value to a 2-digit hex string
  const toHex = (value: number) => {
    const hex = Math.round(value).toString(16).padStart(2, '0');
    return hex;
  };

  // Normalize the opacity value to be between 0 and 1
  opacity = Math.max(0, Math.min(opacity, 1));

  // Convert hex color to RGB
  let r: number, g: number, b: number;
  if (color.startsWith('#')) {
    // Handle hex format (e.g., #RRGGBB or #RGB)
    if (color.length === 7) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else if (color.length === 4) {
      r = parseInt(color[1] + color[1], 16);
      g = parseInt(color[2] + color[2], 16);
      b = parseInt(color[3] + color[3], 16);
    } else {
      throw new Error('Invalid hex color format.');
    }
  } else if (color.startsWith('rgb(')) {
    // Handle RGB format (e.g., rgb(255, 0, 0))
    const rgbValues = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!rgbValues) {
      throw new Error('Invalid RGB color format.');
    }
    r = parseInt(rgbValues[1], 10);
    g = parseInt(rgbValues[2], 10);
    b = parseInt(rgbValues[3], 10);
  } else {
    throw new Error('Unsupported color format.');
  }

  // Convert RGB values and opacity to 8-digit hex format
  const alpha = toHex(opacity * 255);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alpha}`;
}
