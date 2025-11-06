import { OrderBookApi, OrderSigningUtils } from '@cowprotocol/cow-sdk';
import { Trans } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useModalContext } from 'src/hooks/useModal';
import { ActionName, SwapActionFields, TransactionHistoryItem } from 'src/modules/history/types';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { getWalletClient } from 'wagmi/actions';

import { COW_ENV } from '../Swap/helpers/cow';
import { TxActionsWrapper } from '../TxActionsWrapper';

// TODO: check with cow if we can cancel adapters orders
interface CancelCowOrderActionsProps {
  cowOrder: TransactionHistoryItem<SwapActionFields[ActionName.Swap]>;
  blocked: boolean;
}

export const CancelCowOrderActions = ({ cowOrder, blocked }: CancelCowOrderActionsProps) => {
  const { isWrongNetwork } = useIsWrongNetwork(cowOrder.chainId);
  const { mainTxState, loadingTxns, setMainTxState, setTxError } = useModalContext();
  const queryClient = useQueryClient();

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      const orderBookApi = new OrderBookApi({ chainId: cowOrder.chainId, env: COW_ENV });
      const walletClient = await getWalletClient(wagmiConfig, { chainId: cowOrder.chainId });
      if (!walletClient || !walletClient.account) {
        throw new Error('Wallet not connected for signing');
      }
      const { signature, signingScheme } = await OrderSigningUtils.signOrderCancellation(
        cowOrder.id,
        cowOrder.chainId,
        walletClient
      );
      await orderBookApi.sendSignedOrderCancellations({
        orderUids: [cowOrder.id],
        signature,
        signingScheme,
      });
      queryClient.invalidateQueries({ queryKey: 'transactionHistory' });
      setTimeout(() => {
        setMainTxState({
          ...mainTxState,
          loading: false,
          success: true,
        });
      }, 1000 * 5);
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
      isWrongNetwork={isWrongNetwork}
      handleAction={action}
      actionText={<Trans>Send cancel</Trans>}
      actionInProgressText={<Trans>Sending cancel...</Trans>}
      blocked={blocked}
      mainTxState={mainTxState}
      requiresApproval={false}
      preparingTransactions={loadingTxns}
    />
  );
};
