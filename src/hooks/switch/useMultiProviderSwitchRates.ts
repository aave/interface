import { useQuery } from '@tanstack/react-query';
import { SwitchParams, SwitchRatesType } from 'src/components/transactions/Switch/switch.types';
import { queryKeysFactory } from 'src/ui-config/queries';

import { getCowProtocolSellRates } from './cowprotocol.rates';
import { getParaswapSellRates } from './paraswap.rates';
import { useSwitchProvider } from './useSwitchProvider';

export const useMultiProviderSwitchRates = ({
  chainId,
  amount,
  srcToken,
  destToken,
  user,
  inputSymbol,
  outputSymbol,
  srcDecimals,
  destDecimals,
  isTxSuccess,
}: SwitchParams & { isTxSuccess?: boolean }) => {
  const provider = useSwitchProvider({ chainId });
  return useQuery<SwitchRatesType>({
    queryFn: async () => {
      if (!provider) {
        throw new Error('No swap provider found in the selected chain for this pair');
      }

      if (srcToken === destToken) {
        throw new Error('Source and destination tokens cannot be the same');
      }

      switch (provider) {
        case 'cowprotocol':
          return await getCowProtocolSellRates({
            chainId,
            amount,
            srcToken,
            destToken,
            user,
            srcDecimals,
            destDecimals,
            inputSymbol,
            outputSymbol,
          });
        case 'paraswap':
          return await getParaswapSellRates({
            chainId,
            amount,
            srcToken,
            destToken,
            user,
            srcDecimals,
            destDecimals,
            options: {
              partner: 'aave-widget',
            },
          });
      }
    },
    queryKey: queryKeysFactory.cowProtocolRates(chainId, amount, srcToken, destToken, user),
    enabled: amount !== '0' && !isTxSuccess,
    retry: 0,
    throwOnError: false,
    refetchOnWindowFocus: (query) => (query.state.error ? false : true),
  });
};
