import { ApproveType, ERC20Service } from '@aave/contract-helpers';
import { useCallback, useEffect, useState } from 'react';
import { useRootStore } from 'src/store/root';

export const useApprovedAmount = ({
  spender,
  tokenAddress,
}: {
  spender: string;
  tokenAddress: string;
}) => {
  const [provider, account] = useRootStore((state) => [state.jsonRpcProvider, state.account]);
  const [loading, setLoading] = useState(false);
  const [approval, setApproval] = useState<ApproveType>();

  const fetchApprovedAmount = useCallback(
    async (spender: string, tokenAddress: string) => {
      setLoading(true);
      console.log('fetching approved amount');
      const erc20Service = new ERC20Service(provider());
      const approvedTargetAmount = await erc20Service.approvedAmount({
        user: account,
        token: tokenAddress,
        spender,
      });
      setApproval({
        amount: approvedTargetAmount.toString(),
        spender,
        token: tokenAddress,
        user: account,
      });
      setLoading(false);
    },
    [provider, account]
  );

  useEffect(() => {
    if (!spender || !tokenAddress) return;
    fetchApprovedAmount(spender, tokenAddress);
  }, [spender, tokenAddress, fetchApprovedAmount]);

  return {
    loading,
    approval,
  };
};
