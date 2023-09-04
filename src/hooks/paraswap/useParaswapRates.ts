import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from 'src/ui-config/queries';

import { ExactInSwapper } from './common';

type ParaSwapSellRatesParams = {
  amount?: string;
  srcToken?: string;
  srcDecimals?: number;
  destToken?: string;
  destDecimals?: number;
  chainId?: number;
  user?: string;
};

export const useParaswapSellRates = ({
  chainId,
  amount,
  srcToken,
  srcDecimals,
  destToken,
  destDecimals,
  user,
}: ParaSwapSellRatesParams) => {
  return useQuery({
    queryFn: () => {
      if (!!(chainId && amount && srcToken && srcDecimals && destToken && destDecimals && user)) {
        const swapper = ExactInSwapper(chainId);
        return swapper.getRate(amount, srcToken, srcDecimals, destToken, destDecimals, user, {
          partner: 'aave',
        });
      }
    },
    queryKey: [QueryKeys.PARASWAP_RATES, chainId, amount, srcToken, destToken, user],
    enabled: !!(chainId && amount && srcToken && srcDecimals && destToken && destDecimals && user),
  });
};
