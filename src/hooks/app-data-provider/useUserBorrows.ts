import { AaveClient, chainId, evmAddress, OrderDirection } from '@aave/client';
import { userBorrows } from '@aave/client/actions';
import { useQuery } from '@tanstack/react-query';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';

type UseUserBorrowsDataParams = {
  client: AaveClient;
  marketData: MarketDataType;
  account?: string | null;
};

export const useUserBorrows = ({ client, marketData, account }: UseUserBorrowsDataParams) => {
  const userAddress = account ? evmAddress(account) : undefined;

  return useQuery({
    queryKey: [
      ...queryKeysFactory.market(marketData),
      ...queryKeysFactory.user(userAddress ?? 'anonymous'),
      'userBorrows',
    ],
    enabled: !!client && !!userAddress,
    queryFn: async () => {
      const response = await userBorrows(client, {
        markets: [
          {
            chainId: chainId(marketData.chainId),
            address: evmAddress(marketData.addresses.LENDING_POOL),
          },
        ],
        user: userAddress!,
        orderBy: { debt: OrderDirection.Asc },
      });

      if (response.isErr()) throw response.error;
      return response.value;
    },
  });
};
