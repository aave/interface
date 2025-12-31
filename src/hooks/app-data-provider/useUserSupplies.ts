import { AaveClient, chainId, evmAddress, OrderDirection } from '@aave/client';
import { userSupplies } from '@aave/client/actions';
import { useQuery } from '@tanstack/react-query';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';

type UseUserSuppliesDataParams = {
  client: AaveClient;
  marketData: MarketDataType;
  account?: string | null;
};

export const useUserSupplies = ({ client, marketData, account }: UseUserSuppliesDataParams) => {
  const userAddress = account ? evmAddress(account) : undefined;

  return useQuery({
    queryKey: [
      ...queryKeysFactory.market(marketData),
      ...queryKeysFactory.user(userAddress ?? 'anonymous'),
      'userSupplies',
    ],
    enabled: !!client && !!userAddress,
    queryFn: async () => {
      const response = await userSupplies(client, {
        markets: [
          {
            chainId: chainId(marketData.chainId),
            address: evmAddress(marketData.addresses.LENDING_POOL),
          },
        ],
        user: userAddress!,
        orderBy: { balance: OrderDirection.Asc },
      });

      if (response.isErr()) throw response.error;
      return response.value;
    },
  });
};
