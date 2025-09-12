import { useQuery } from '@tanstack/react-query';
import { TokenInfo } from 'src/ui-config/TokenList';

import { getTokenUsdPrice } from './switch/cowprotocol.rates';

interface Args {
  chainId: number;
  inputToken: TokenInfo;
  outputToken: TokenInfo;
}

export const useStaticRate = ({ chainId, inputToken, outputToken }: Args) => {
  return useQuery({
    queryKey: ['staticRate', chainId, inputToken.address, outputToken.address],
    queryFn: async () => {
      const inputUsdPricePromise = getTokenUsdPrice(
        chainId,
        inputToken.address,
        Boolean(inputToken.extensions?.isUserCustom),
        true
      );
      const outputUsdPricePromise = getTokenUsdPrice(
        chainId,
        outputToken.address,
        Boolean(outputToken.extensions?.isUserCustom),
        true
      );
      const [inputUsdPrice, outputUsdPrice] = await Promise.all([
        inputUsdPricePromise,
        outputUsdPricePromise,
      ]);
      if (!inputUsdPrice || !outputUsdPrice) {
        return { inputUsdPrice: '0', outputUsdPrice: '0', rate: '0' };
      }
      const rate = (Number(outputUsdPrice) / Number(inputUsdPrice)).toString();
      return { inputUsdPrice, outputUsdPrice, rate };
    },
  });
};
