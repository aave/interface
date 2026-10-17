import type { QueryClient } from '@tanstack/react-query';
import type { MarketDataType } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';

export const refetchSupplyPoolData = async (
  queryClient: QueryClient,
  account: string,
  marketData: MarketDataType
) => {
  await queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });

  if (account) {
    await queryClient.refetchQueries({
      queryKey: queryKeysFactory.poolTokens(account, marketData),
      type: 'active',
    });
  }
};
