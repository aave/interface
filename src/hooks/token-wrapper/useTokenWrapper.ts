import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

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
    queryKey: ['tokenInForTokenOut', tokenWrapperAddress, amount],
    select: (data) => formatUnits(data.toString(), decimals),
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
    queryKey: ['tokenOutForTokenIn', tokenWrapperAddress, amount],
    select: (data) => formatUnits(data.toString(), decimals),
  });
};
