import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useApprovedAmount = ({
  token,
  spender,
}: {
  user: string;
  token: string;
  spender: string;
}) => {
  const { approvedAmountService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => approvedAmountService.getApprovedAmount(user, token, spender),
    queryKey: [QueryKeys.APPROVED_AMOUNT, user, token, spender],
    enabled: !!user,
  });
};

export const usePoolApprovedAmount = (token: string) => {
  const { approvedAmountService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => approvedAmountService.getPoolApprovedAmount(user, token),
    queryKey: [QueryKeys.POOL_APPROVED_AMOUNT, user, token],
    enabled: !!user,
  });
};
