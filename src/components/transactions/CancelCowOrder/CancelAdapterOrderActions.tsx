import { OrderStatus, SupportedChainId } from '@cowprotocol/cow-sdk';
import { Trans } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { Interface } from 'ethers/lib/utils';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import {
  ActionName,
  CowSwapSubset,
  isCowSwapSubset,
  SwapActionFields,
  TransactionHistoryItem,
} from 'src/modules/history/types';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { updateCowOrderStatus } from 'src/utils/swapAdapterHistory';

import { ADAPTER_FACTORY } from '../Swap/constants/cow.constants';
import { TxActionsWrapper } from '../TxActionsWrapper';

interface CancelAdapterOrderActionsProps {
  cowOrder: TransactionHistoryItem<
    | SwapActionFields[ActionName.DebtSwap]
    | SwapActionFields[ActionName.RepayWithCollateral]
    | SwapActionFields[ActionName.CollateralSwap]
  >;
  blocked: boolean;
}

// ABI for cancelInstance function
const ADAPTER_ABI = ['function cancelInstance(address instance) external'];

export const CancelAdapterOrderActions = ({
  cowOrder,
  blocked,
}: CancelAdapterOrderActionsProps) => {
  const { isWrongNetwork } = useIsWrongNetwork(cowOrder.chainId);
  const { mainTxState, loadingTxns, setMainTxState, setTxError } = useModalContext();
  const { sendTx } = useWeb3Context();
  const queryClient = useQueryClient();
  const account = useRootStore((state) => state.account);

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });

      // Type guard to ensure we have a CowSwapSubset with adapter fields
      if (!isCowSwapSubset(cowOrder)) {
        throw new Error('Order is not a CoW swap order');
      }

      // At this point TypeScript knows cowOrder is CowSwapSubset, but we need to assert it has adapter fields
      const cowSwapOrder = cowOrder as CowSwapSubset;

      if (!cowSwapOrder.adapterInstanceAddress) {
        throw new Error('Adapter instance address not found');
      }

      const adapterInterface = new Interface(ADAPTER_ABI);

      const factoryAddress = ADAPTER_FACTORY[cowOrder.chainId as SupportedChainId];

      if (!factoryAddress) {
        throw new Error('Factory address not found for this chain');
      }

      const data = adapterInterface.encodeFunctionData('cancelInstance', [
        cowSwapOrder.adapterInstanceAddress,
      ]);

      const txResponse = await sendTx({
        to: factoryAddress,
        data,
        chainId: cowOrder.chainId,
      });

      await txResponse.wait(1);

      // Update order status to cancelled in local storage
      if (account && cowSwapOrder.orderId) {
        updateCowOrderStatus(
          cowOrder.chainId,
          account,
          cowSwapOrder.orderId,
          OrderStatus.CANCELLED
        );
      }

      queryClient.invalidateQueries({ queryKey: 'transactionHistory' });
      setMainTxState({
        ...mainTxState,
        loading: false,
        success: true,
        txHash: txResponse.hash,
      });
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.MAIN_ACTION, false);
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
      actionText={<Trans>Cancel order</Trans>}
      actionInProgressText={<Trans>Cancelling order...</Trans>}
      blocked={blocked}
      mainTxState={mainTxState}
      requiresApproval={false}
      preparingTransactions={loadingTxns}
    />
  );
};
