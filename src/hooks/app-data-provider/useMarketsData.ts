import { AaveClient, chainId, evmAddress, OrderDirection } from '@aave/client';
import { markets } from '@aave/client/actions';
import { useQuery } from '@tanstack/react-query';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';

type UseMarketsDataParams = {
  client: AaveClient;
  marketData: MarketDataType;
  account?: string | null;
};

export const useMarketsData = ({ client, marketData, account }: UseMarketsDataParams) => {
  const userAddress = account ? evmAddress(account) : undefined;
  const marketKey = [
    ...queryKeysFactory.market(marketData),
    ...queryKeysFactory.user(userAddress ?? 'anonymous'),
  ];

  return useQuery({
    queryKey: marketKey,
    enabled: !!client,
    queryFn: async () => {
      const response = await markets(client, {
        chainIds: [chainId(marketData.chainId)],
        user: userAddress,
        suppliesOrderBy: { tokenName: OrderDirection.Asc },
        borrowsOrderBy: { tokenName: OrderDirection.Asc },
      });

      if (response.isErr()) {
        throw response.error;
      }

      return response.value;
    },
  });
};
