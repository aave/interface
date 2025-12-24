import { withdraw } from '@aave/client/actions';
import { sendWith } from '@aave/client/viem';
import { gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import type { WithdrawRequest } from '@aave/graphql';
import { ChainId, evmAddress } from '@aave/types';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { client } from 'pages/_app.page';
import { useEffect } from 'react';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { getWalletClient } from 'wagmi/actions';
import { useShallow } from 'zustand/react/shallow';

import { TxActionsWrapper } from '../TxActionsWrapper';

export interface WithdrawActionsPropsSDK extends BoxProps {
  poolReserve: ReserveWithId;
  amountToWithdraw: string;
  poolAddress: string;
  isWrongNetwork: boolean;
  withdrawNative: boolean;
  usdAmount: string;
  requestAmount: WithdrawRequest['amount'];
  symbol: string;
  blocked: boolean;
}

export const WithdrawActionsSDK = ({
  symbol,
  amountToWithdraw = '0',
  usdAmount,
  poolAddress,
  isWrongNetwork,
  requestAmount,
  blocked,
  sx,
}: WithdrawActionsPropsSDK) => {
  const [currentMarketData, addTransaction] = useRootStore(
    useShallow((state) => [state.currentMarketData, state.addTransaction])
  );
  const {
    approvalTxState,
    mainTxState,
    loadingTxns,
    setMainTxState,
    setTxError,
    setGasLimit,
    setLoadingTxns,
  } = useModalContext();

  const queryClient = useQueryClient();
  const { currentAccount, chainId: userChainId } = useWeb3Context();

  useEffect(() => {
    const withdrawGasLimit = Number(gasLimitRecommendations[ProtocolAction.withdraw].recommended);
    setGasLimit(withdrawGasLimit.toString());
  }, [setGasLimit]);

  const handleAction = async () => {
    if (!amountToWithdraw || Number(amountToWithdraw) === 0) return;

    try {
      setLoadingTxns(true);
      setMainTxState({ ...mainTxState, loading: true });
      setTxError(undefined);

      const walletClient = await getWalletClient(wagmiConfig, {
        chainId: currentMarketData.chainId ?? userChainId,
      });

      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      const result = await withdraw(client, {
        market: evmAddress(currentMarketData.addresses.LENDING_POOL),
        amount: requestAmount,
        sender: evmAddress(currentAccount),
        recipient: evmAddress(currentAccount),
        chainId: currentMarketData.chainId as ChainId,
      })
        .andThen(sendWith(walletClient))
        .andThen(client.waitForTransaction);

      if (result.isErr()) {
        const parsedError = getErrorTextFromError(
          result.error as Error,
          TxAction.MAIN_ACTION,
          false
        );
        setTxError(parsedError);
        setMainTxState({ txHash: undefined, loading: false });
        return;
      }

      const txHash = String(result.value);
      setMainTxState({
        txHash,
        loading: false,
        success: true,
      });

      addTransaction(txHash, {
        action: ProtocolAction.withdraw,
        txState: 'success',
        asset: poolAddress,
        amount: amountToWithdraw,
        assetName: symbol,
        amountUsd: usdAmount,
      });

      queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
      queryClient.invalidateQueries({ queryKey: queryKeysFactory.gho });
    } catch (error) {
      const parsedError = getErrorTextFromError(error as Error, TxAction.MAIN_ACTION, false);
      setTxError(parsedError);
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    } finally {
      setLoadingTxns(false);
    }
  };

  return (
    <TxActionsWrapper
      blocked={blocked}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      requiresAmount={true}
      amount={amountToWithdraw || '0'}
      isWrongNetwork={isWrongNetwork}
      handleAction={handleAction}
      actionText={<Trans>Withdraw {symbol}</Trans>}
      actionInProgressText={<Trans>Withdraw {symbol}</Trans>}
      handleApproval={undefined}
      requiresApproval={false}
      preparingTransactions={loadingTxns}
      sx={sx}
    />
  );
};
