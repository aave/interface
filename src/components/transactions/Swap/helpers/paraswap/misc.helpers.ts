import { SwapType } from '../../types/shared.types';
import { getAssetGroup } from '../shared/assetCorrelation.helpers';

export const getParaswapSlippage = (
  inputSymbol: string,
  outputSymbol: string,
  swapType: SwapType
): string => {
  const inputGroup = getAssetGroup(inputSymbol);
  const outputGroup = getAssetGroup(outputSymbol);

  const baseSlippage = inputGroup === outputGroup ? '0.10' : '0.20';

  if (swapType === SwapType.DebtSwap) {
    return (Number(baseSlippage) * 2).toString();
  }

  return baseSlippage;
};
