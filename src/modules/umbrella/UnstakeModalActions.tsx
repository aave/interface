import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { PopulatedTransaction } from 'ethers';
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
import { queryKeysFactory } from 'src/ui-config/queries';
import { useShallow } from 'zustand/shallow';

import { StakeGatewayService } from './services/StakeGatewayService';
import { StakeTokenService } from './services/StakeTokenService';

export interface UnStakeActionProps extends BoxProps {
  amountToUnStake: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  blocked: boolean;
  stakeData: MergedStakeData;
  redeemATokens: boolean;
}

const STAKE_GATEWAY_CONTRACT = '0x57c6a660a271A1A23cC1cc283B98Ac2C01Ad3695';

export const UnStakeActions = ({
  amountToUnStake,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  stakeData,
  redeemATokens,
}: UnStakeActionProps) => {
  const queryClient = useQueryClient();
  const [currentChainId, user, estimateGasLimit] = useRootStore(
    useShallow((store) => [store.currentChainId, store.account, store.estimateGasLimit])
  );
  const { sendTx } = useWeb3Context();
  const {
    approvalTxState,
    mainTxState,
    loadingTxns,
    setLoadingTxns,
    // setApprovalTxState,
    setMainTxState,
    // setGasLimit,
    setTxError,
  } = useModalContext();

  const selectedToken = stakeData.stakeToken;

  const {
    data: approvedAmount,
    isFetching: fetchingApprovedAmount,
    refetch: fetchApprovedAmount,
  } = useApprovedAmount({
    chainId: currentChainId,
    token: selectedToken,
    spender: STAKE_GATEWAY_CONTRACT,
  });

  setLoadingTxns(fetchingApprovedAmount);

  const requiresApproval =
    Number(amountToUnStake) !== 0 &&
    checkRequiresApproval({
      approvedAmount: approvedAmount?.toString() || '0',
      amount: amountToUnStake,
      signedAmount: '0',
    });

  const tokenApproval = {
    user,
    token: selectedToken,
    spender: STAKE_GATEWAY_CONTRACT,
    amount: amountToUnStake,
  };

  const parsedAmountToStake = parseUnits(amountToUnStake, stakeData.decimals);

  const { approval } = useApprovalTx({
    usePermit: false,
    approvedAmount: tokenApproval,
    requiresApproval,
    assetAddress: selectedToken,
    symbol: 'USDC',
    decimals: stakeData.decimals,
    amountToApprove: parsedAmountToStake.toString(),
    onApprovalTxConfirmed: fetchApprovedAmount,
    signatureAmount: '0', // formatUnits(amountToApprove, stakeData.decimals).toString(),
    // onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
  });

  console.log('requires approval', requiresApproval);
  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      let unstakeTxData: PopulatedTransaction;
      if (stakeData.underlyingIsWaToken) {
        // use the stake gateway
        const stakeService = new StakeGatewayService(STAKE_GATEWAY_CONTRACT);
        if (redeemATokens) {
          unstakeTxData = stakeService.redeemATokens(
            user,
            stakeData.stakeToken,
            parsedAmountToStake.toString()
          );
        } else {
          unstakeTxData = stakeService.redeem(
            user,
            stakeData.stakeToken,
            parsedAmountToStake.toString()
          );
        }
      } else {
        // use stake token directly
        const stakeTokenService = new StakeTokenService(stakeData.stakeToken);
        unstakeTxData = stakeTokenService.redeem(user, parsedAmountToStake.toString());
      }

      unstakeTxData = await estimateGasLimit(unstakeTxData);
      const tx = await sendTx(unstakeTxData);
      await tx.wait(1);
      setMainTxState({
        txHash: tx.hash,
        loading: false,
        success: true,
      });
      queryClient.invalidateQueries({ queryKey: ['umbrella'] });
      queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
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
      blocked={blocked}
      handleAction={action}
      handleApproval={approval}
      requiresAmount
      amount={amountToUnStake}
      actionText={<Trans>Unstake {symbol}</Trans>}
      actionInProgressText={<Trans>Unstaking {symbol}</Trans>}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      preparingTransactions={loadingTxns}
      sx={sx}
    />
  );
};
