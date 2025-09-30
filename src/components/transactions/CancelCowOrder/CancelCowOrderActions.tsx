import { OrderBookApi, OrderSigningUtils } from '@cowprotocol/cow-sdk';
import { Trans } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useModalContext } from 'src/hooks/useModal';
import { getEthersProvider } from 'src/libs/web3-data-provider/adapters/EthersAdapter';
import { ActionFields, TransactionHistoryItem } from 'src/modules/history/types';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';

import { TxActionsWrapper } from '../TxActionsWrapper';

interface CancelCowOrderActionsProps {
  cowOrder: TransactionHistoryItem<ActionFields['CowSwap']>;
  blocked: boolean;
}

export const CancelCowOrderActions = ({ cowOrder, blocked }: CancelCowOrderActionsProps) => {
  const { isWrongNetwork } = useIsWrongNetwork(cowOrder.chainId);
  const { mainTxState, loadingTxns, setMainTxState, setTxError } = useModalContext();
  const queryClient = useQueryClient();

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      const provider = getEthersProvider(wagmiConfig, { chainId: cowOrder.chainId });
      const signer = (await provider).getSigner();
      const orderBookApi = new OrderBookApi({ chainId: cowOrder.chainId });
      const { signature, signingScheme } = await OrderSigningUtils.signOrderCancellation(
        cowOrder.id,
        cowOrder.chainId,
        signer
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
