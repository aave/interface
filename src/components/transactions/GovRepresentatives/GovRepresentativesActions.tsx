import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { queryClient } from 'pages/_app.page';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { TxActionsWrapper } from '../TxActionsWrapper';

export const GovRepresentativesActions = ({
  blocked,
  isWrongNetwork,
}: {
  blocked: boolean;
  isWrongNetwork: boolean;
}) => {
  const { mainTxState, setMainTxState, setTxError } = useModalContext();
  const { governanceV3Service } = useSharedDependencies();
  const { sendTx } = useWeb3Context();
  const [account, estimateGasLimit, addTransaction] = useRootStore((state) => [
    state.account,
    state.estimateGasLimit,
    state.addTransaction,
  ]);

  const action = async () => {
    setMainTxState({ ...mainTxState, loading: true });

    try {
      let populatedTx = governanceV3Service.updateRepresentativesForChain(account, [
        { chainId: ChainId.sepolia, representative: '0xf0aF78eFcC9e307884738c8d8D2B931ddee901f5' },
      ]);

      populatedTx = await estimateGasLimit(populatedTx);
      const response = await sendTx(populatedTx);
      await response.wait(1);

      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
      });

      addTransaction(response.hash, {
        action: 'change representative',
        txState: 'success',
      });

      queryClient.invalidateQueries({
        queryKey: queryKeysFactory.governanceRepresentatives(account),
      });
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
      requiresApproval={false}
      blocked={blocked}
      mainTxState={mainTxState}
      preparingTransactions={false}
      handleAction={action}
      actionText={<Trans>Confirm transaction</Trans>}
      actionInProgressText={<Trans>Confirming transaction</Trans>}
      isWrongNetwork={isWrongNetwork}
    />
  );
};
