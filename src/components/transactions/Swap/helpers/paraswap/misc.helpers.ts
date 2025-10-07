import { getAssetGroup } from '../shared/assetCorrelation.helpers';

export const getParaswapSlippage = (inputSymbol: string, outputSymbol: string): string => {
  const inputGroup = getAssetGroup(inputSymbol);
  const outputGroup = getAssetGroup(outputSymbol);

  return inputGroup === outputGroup ? '0.10' : '0.20';
};
