import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { useApprovalTx } from 'src/hooks/useApprovalTx';
import { useApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { useShallow } from 'zustand/shallow';

import { StakeGatewayService } from './services/StakeGatewayService';

export interface StakeActionProps extends BoxProps {
  amountToStake: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  blocked: boolean;
  selectedToken: string;
  event: string;
}

export const UmbrellaActions = ({
  amountToStake,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  selectedToken,
  event,
  ...props
}: StakeActionProps) => {
  const [estimateGasLimit, tryPermit] = useRootStore(
    useShallow((state) => [state.estimateGasLimit, state.tryPermit])
  );

  const {
    approvalTxState,
    mainTxState,
    loadingTxns,
    setLoadingTxns,
    setApprovalTxState,
    setMainTxState,
    setGasLimit,
    setTxError,
  } = useModalContext();

  const { data: approvedAmount } = useApprovedAmount({
    chainId: 1,
    token: selectedToken,
    spender: '',
  });

  const {} = useApprovalTx({});

  const { currentAccount, sendTx } = useWeb3Context();

  const requiresApproval = false;

  const permitAvailable = tryPermit({ reserveAddress: selectedToken, os });

  const usePermit = permitAvailable && walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      const stakeService = new StakeGatewayService('');
      let stakeTxData = stakeService.stake(currentAccount, '', '');
      stakeTxData = await estimateGasLimit(stakeTxData);
      const tx = await sendTx(stakeTxData);
      await tx.wait(1);
      setMainTxState({
        txHash: tx.hash,
        loading: false,
        success: true,
      });

      // addTransaction(response.hash, {
      //   action,
      //   txState: 'success',
      //   asset: poolAddress,
      //   amount: amountToSupply,
      //   assetName: symbol,
      // });

      // queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      amount={amountToStake}
      handleAction={action}
      handleApproval={() =>
        approval([{ amount: amountToStake, underlyingAsset: selectedToken, permitType: 'STAKE' }])
      }
      symbol={symbol}
      requiresAmount
      actionText={<Trans>Stake</Trans>}
      tryPermit={tryPermit}
      actionInProgressText={<Trans>Staking</Trans>}
      sx={sx}
      // event={STAKE.STAKE_BUTTON_MODAL}
      {...props}
    />
  );
};
