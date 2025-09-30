import { useQuery } from '@tanstack/react-query';
import { HEADER_WIDGET_APP_CODE } from 'src/components/transactions/Switch/cowprotocol/cowprotocol.helpers';
import {
  CowProtocolRatesType,
  MultiProviderRatesParams,
} from 'src/components/transactions/Switch/switch.types';
import { queryKeysFactory } from 'src/ui-config/queries';

import { getCowProtocolSellRates } from './cowprotocol.rates';

export const useCowSwitchRates = ({
  chainId,
  amount,
  srcUnderlyingToken,
  destUnderlyingToken,
  user,
  inputSymbol,
  isInputTokenCustom,
  isOutputTokenCustom,
  outputSymbol,
  srcDecimals,
  destDecimals,
  isTxSuccess,
  isExecutingActions = false,
}: MultiProviderRatesParams & {
  isTxSuccess?: boolean;
  isExecutingActions?: boolean;
}) => {
  return useQuery<CowProtocolRatesType>({
    queryFn: async () => {
      return await getCowProtocolSellRates({
        chainId,
        amount,
        srcToken: srcUnderlyingToken,
        destToken: destUnderlyingToken,
        user,
        srcDecimals,
        destDecimals,
        inputSymbol,
        outputSymbol,
        isInputTokenCustom,
        isOutputTokenCustom,
        appCode: HEADER_WIDGET_APP_CODE,
      });
    },
    queryKey: queryKeysFactory.cowProtocolRates(
      chainId,
      amount,
      srcUnderlyingToken,
      destUnderlyingToken,
      user
    ),
    enabled: amount !== '0' && !isTxSuccess,
    retry: 0,
    throwOnError: false,
    refetchOnWindowFocus: (query) => (query.state.error ? false : true),
    refetchInterval: !isExecutingActions ? 30000 : false, // 30 seconds, but pause during action execution
  });
};
