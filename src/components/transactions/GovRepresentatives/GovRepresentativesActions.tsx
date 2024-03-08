import { Trans } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ZERO_ADDRESS } from 'src/modules/governance/utils/formatProposal';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { UIRepresentative } from './GovRepresentativesModalContent';

export const GovRepresentativesActions = ({
  blocked,
  isWrongNetwork,
  representatives,
}: {
  blocked: boolean;
  isWrongNetwork: boolean;
  representatives: UIRepresentative[];
}) => {
  const { mainTxState, setMainTxState, setTxError, setGasLimit } = useModalContext();
  const { governanceV3Service } = useSharedDependencies();
  const { sendTx } = useWeb3Context();
  const queryClient = useQueryClient();
  const [account, estimateGasLimit, addTransaction] = useRootStore((state) => [
    state.account,
    state.estimateGasLimit,
    state.addTransaction,
  ]);

  const action = async () => {
    setMainTxState({ ...mainTxState, loading: true });

    try {
      let populatedTx = governanceV3Service.updateRepresentativesForChain(
        account,
        representatives.map((r) => ({
          chainId: r.chainId,
          representative: r.representative === '' || r.remove ? ZERO_ADDRESS : r.representative,
        }))
      );

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

  setGasLimit('100000'); // TODO

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
