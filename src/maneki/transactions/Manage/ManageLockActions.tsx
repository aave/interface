import { Trans } from '@lingui/macro';
import { BigNumber, Contract } from 'ethers';
import { useEffect, useState } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import MULTI_FEE_ABI from 'src/maneki/modules/manage/MultiFeeABI';
import PAW_TOKEN_ABI from 'src/maneki/modules/manage/PAWTokenABI';
import { toWeiString } from 'src/maneki/modules/manage/utils/stringConverter';
import { TxAction } from 'src/ui-config/errorMapping';
import { marketsData } from 'src/ui-config/marketsConfig';

interface ManageLockActionsProps {
  symbol: string;
  amount: string;
  isWrongNetwork: boolean;
}

export const ManageLockActions = ({ symbol, amount, isWrongNetwork }: ManageLockActionsProps) => {
  const [requiresApproval, setRequiresApproval] = useState<boolean>(false);
  const { provider, currentAccount } = useWeb3Context();
  const { mainTxState, setMainTxState, setTxError, approvalTxState, setApprovalTxState } =
    useModalContext();
  const PAW_TOKEN_ADDR = marketsData.bsc_testnet_v3.addresses.PAW_TOKEN as string;
  const MULTI_FEE_ADDR = marketsData.bsc_testnet_v3.addresses.COLLECTOR as string;

  const handleApproval = async () => {
    setApprovalTxState({
      loading: true,
    });
    try {
      const signer = provider?.getSigner(currentAccount as string);
      const pawContract = new Contract(PAW_TOKEN_ADDR, PAW_TOKEN_ABI, signer);
      const approve = await pawContract.approve(
        MULTI_FEE_ADDR,
        BigNumber.from(toWeiString(amount))
      );
      await approve.wait(1);
      setApprovalTxState({
        txHash: approve.hash,
        loading: false,
        success: true,
      });
      setTxError(undefined);
      setMainTxState({ loading: false });
    } catch (error) {
      setApprovalTxState({
        loading: false,
        success: false,
      });

      setTxError({
        blocking: false,
        actionBlocked: false,
        error: <Trans>Approval error</Trans>,
        rawError: error,
        txAction: TxAction.APPROVAL,
      });
    }
  };

  const handleAction = async () => {
    setMainTxState({ loading: true });
    try {
      const signer = provider?.getSigner(currentAccount as string);
      const contract = new Contract(MULTI_FEE_ADDR, MULTI_FEE_ABI, signer);
      const promises = await contract.stake(BigNumber.from(toWeiString(amount)), true);
      await promises.wait(1);
      setMainTxState({
        loading: false,
        success: true,
        txHash: promises.hash,
      });
    } catch (error) {
      setMainTxState({
        loading: false,
        success: false,
      });
      setTxError({
        blocking: false,
        actionBlocked: false,
        error: <Trans>Locking Failed</Trans>,
        rawError: error,
        txAction: TxAction.MAIN_ACTION,
      });
    }
  };

  useEffect(() => {
    const pawContract = new Contract(PAW_TOKEN_ADDR, PAW_TOKEN_ABI, provider);
    Promise.resolve(pawContract.allowance(currentAccount, MULTI_FEE_ADDR) as BigNumber).then(
      (value) => {
        if (value.lt(BigNumber.from(toWeiString(amount)))) {
          setRequiresApproval(true);
        } else {
          setApprovalTxState({
            loading: false,
            success: true,
          });
          setTxError(undefined);
          setMainTxState({ loading: false });
        }
      }
    );
  }, [amount]);

  return (
    <TxActionsWrapper
      symbol={symbol}
      requiresAmount
      amount={amount}
      actionText={<Trans>Lock {symbol}</Trans>}
      actionInProgressText={<Trans>Locking {symbol}</Trans>}
      isWrongNetwork={isWrongNetwork}
      requiresApproval={requiresApproval}
      handleApproval={handleApproval}
      approvalTxState={approvalTxState}
      mainTxState={mainTxState}
      handleAction={handleAction}
      preparingTransactions={false}
    />
  );
};
