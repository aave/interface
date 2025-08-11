import { ChainId, ProtocolAction } from '@aave/contract-helpers';
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

export type ExternalIncentivesTooltipsConfig = {
  superFestRewards: boolean;
  spkAirdrop: boolean;
  kernelPoints: boolean;
};

export const showExternalIncentivesTooltip = (
  symbol: string,
  currentMarket: string,
  protocolAction?: ProtocolAction
) => {
  const superFestRewardsEnabled = false;
  const spkRewardsEnabled = false;
  const kernelPointsEnabled = true;

  const tooltipsConfig: ExternalIncentivesTooltipsConfig = {
    superFestRewards: false,
    spkAirdrop: false,
    kernelPoints: false,
  };

  if (
    superFestRewardsEnabled &&
    currentMarket === CustomMarket.proto_base_v3 &&
    protocolAction === ProtocolAction.supply &&
    (symbol == 'ETH' || symbol == 'WETH' || symbol == 'wstETH')
  ) {
    tooltipsConfig.superFestRewards = true;
  }

  if (
    spkRewardsEnabled &&
    currentMarket === CustomMarket.proto_mainnet_v3 &&
    protocolAction === ProtocolAction.supply &&
    symbol == 'USDS'
  ) {
    tooltipsConfig.spkAirdrop = true;
  }

  if (
    kernelPointsEnabled &&
    (currentMarket === CustomMarket.proto_mainnet_v3 ||
      currentMarket === CustomMarket.proto_lido_v3 ||
      currentMarket === CustomMarket.proto_base_v3 ||
      currentMarket === CustomMarket.proto_arbitrum_v3) &&
    protocolAction === ProtocolAction.supply &&
    (symbol == 'rsETH' || symbol == 'wrsETH')
  ) {
    tooltipsConfig.kernelPoints = true;
  }

  return tooltipsConfig;
};

/**
 * Converts APR to APY using monthly compounding
 * Assumes users claim rewards once per month and reinvest them
 * Formula: APY = (1 + APR/12)^12 - 1
 *
 * This function is used to align incentive calculations with other protocol APYs
 * throughout the app, providing more accurate representations of compound returns.
 *
 * @param apr - Annual Percentage Rate as a decimal (e.g., 0.05 for 5%)
 * @returns APY as a decimal
 */
export const convertAprToApy = (apr: number): number => {
  const monthlyRate = apr / 12;
  const apy = Math.pow(1 + monthlyRate, 12) - 1;
  return apy;
};
