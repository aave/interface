import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { checkRequiresApproval } from 'src/components/transactions/utils';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useApprovalTx } from 'src/hooks/useApprovalTx';
import { useApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { useShallow } from 'zustand/shallow';

import { StakeGatewayService } from './services/StakeGatewayService';
import { StakeInputAsset } from './UmbrellaModalContent';

export interface StakeActionProps extends BoxProps {
  amountToStake: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  blocked: boolean;
  stakeData: MergedStakeData;
  selectedToken: StakeInputAsset;
  event: string;
}

const STAKE_GATEWAY_CONTRACT = '0x169e71ef44e0f67d21a4722eb51a6119f23da421';

export const UmbrellaActions = ({
  amountToStake,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  selectedToken,
  event,
  stakeData,
  ...props
}: StakeActionProps) => {
  const [estimateGasLimit] = useRootStore(useShallow((state) => [state.estimateGasLimit]));

  const currentChainId = useRootStore((store) => store.currentChainId);
  const user = useRootStore((store) => store.account);

  const {
    approvalTxState,
    mainTxState,
    loadingTxns,
    // setLoadingTxns,
    // setApprovalTxState,
    setMainTxState,
    // setGasLimit,
    setTxError,
  } = useModalContext();

  const { data: approvedAmount, refetch: fetchApprovedAmount } = useApprovedAmount({
    chainId: currentChainId,
    token: selectedToken.address,
    spender: STAKE_GATEWAY_CONTRACT,
  });

  const amountToApprove =
    amountToStake === '-1'
      ? (selectedToken.aToken
          ? Number(selectedToken.balance) * 1.1
          : selectedToken.balance
        ).toString()
      : amountToStake;

  const requiresApproval =
    Number(amountToStake) !== 0 &&
    checkRequiresApproval({
      approvedAmount: approvedAmount?.toString() || '0',
      amount: amountToApprove,
      signedAmount: '0',
    });

  const tokenApproval = {
    user,
    token: selectedToken.address,
    spender: STAKE_GATEWAY_CONTRACT,
    amount: amountToApprove,
  };

  const { approval } = useApprovalTx({
    usePermit: false,
    approvedAmount: tokenApproval,
    requiresApproval,
    assetAddress: selectedToken.address,
    symbol: selectedToken.symbol,
    decimals: stakeData.decimals,
    onApprovalTxConfirmed: fetchApprovedAmount,
    signatureAmount: '0',
  });

  const { currentAccount, sendTx } = useWeb3Context();

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      const stakeService = new StakeGatewayService(STAKE_GATEWAY_CONTRACT);
      let stakeTxData = stakeService.stake(
        currentAccount,
        stakeData.stakeToken,
        amountToStake === '-1'
          ? parseUnits(selectedToken.balance, stakeData.decimals).toString()
          : parseUnits(amountToStake, stakeData.decimals).toString()
      );
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
      handleApproval={approval}
      symbol={symbol}
      requiresAmount
      actionText={<Trans>Stake</Trans>}
      tryPermit={false}
      actionInProgressText={<Trans>Staking</Trans>}
      sx={sx}
      // event={STAKE.STAKE_BUTTON_MODAL}
      {...props}
    />
  );
};
