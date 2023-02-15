import { ChainId } from '@aave/contract-helpers';
import { BigNumber } from 'bignumber.js';

export enum ErrorType {
  SUPPLY_CAP_REACHED,
  HF_BELOW_ONE,
  FLASH_LOAN_NOT_AVAILABLE,
  NOT_ENOUGH_COLLATERAL_TO_REPAY_WITH,
  TARGET_RESERVE_IS_FROZEN,
}

export const useFlashloan = (healthFactor: string, hfEffectOfFromAmount: string) => {
  return (
    healthFactor !== '-1' &&
    new BigNumber(healthFactor).minus(new BigNumber(hfEffectOfFromAmount)).lt('1.05')
  );
};

// The stETH contract has a bug where there is a 2gwei precision error when
// calling balanceOf() making it impossible to flashlon this asset.
const stETHAddress = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84';
const stETHChainId = ChainId.mainnet;

export const flashLoanNotAvailable = (underlyingAsset: string, currentChainId: number) => {
  return underlyingAsset === stETHAddress && currentChainId === stETHChainId;
};
