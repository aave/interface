import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useRootStore } from 'src/store/root';
import { POLLING_INTERVAL } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { WrappedTokenConfig } from '../app-data-provider/useAppDataProvider';

export const useTokenInForTokenOut = (
  amount: string,
  decimals: number,
  tokenWrapperAddress: string
) => {
  const { tokenWrapperService } = useSharedDependencies();
  return useQuery({
    queryFn: () => {
      if (amount === '' || amount === '0') return Promise.resolve(BigNumber.from(0));

      return tokenWrapperService.getTokenInForTokenOut(
        parseUnits(amount, decimals).toString(),
        tokenWrapperAddress
      );
    },
    queryKey: [tokenWrapperAddress, amount],
    select: (data) => formatUnits(data.toString(), decimals),
    enabled: tokenWrapperAddress !== '',
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useTokenOutForTokenIn = (
  amount: string,
  decimals: number,
  tokenWrapperAddress: string
) => {
  const { tokenWrapperService } = useSharedDependencies();
  return useQuery({
    queryFn: () => {
      if (amount === '' || amount === '0') return Promise.resolve(BigNumber.from(0));

      return tokenWrapperService.getTokenOutForTokenIn(
        parseUnits(amount, decimals).toString(),
        tokenWrapperAddress
      );
    },
    queryKey: [tokenWrapperAddress, amount],
    select: (data) => formatUnits(data.toString(), decimals),
    enabled: tokenWrapperAddress !== '',
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useTokenInBalances = (wrappedTokenConfig: WrappedTokenConfig[]) => {
  const { poolTokensBalanceService } = useSharedDependencies();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const user = useRootStore((store) => store.account);

  const tokenInAddresses = wrappedTokenConfig.map((token) => token.tokenIn.underlyingAsset);

  return useQuery({
    queryFn: () =>
      poolTokensBalanceService.getWrappedTokenInBalances(tokenInAddresses, currentMarketData, user),
    queryKey: [tokenInAddresses, user],
    enabled: !!user,
    refetchInterval: POLLING_INTERVAL,
  });
};
