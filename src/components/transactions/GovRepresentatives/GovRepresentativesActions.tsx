import { ChainId } from '@aave/contract-helpers';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { TxActionsWrapper } from '../TxActionsWrapper';

export const GovRepresentativesActions = () => {
  const { mainTxState } = useModalContext();
  const { governanceV3Service } = useSharedDependencies();
  const account = useRootStore((state) => state.account);

  const action = async () => {
    console.log('TODO');
    const populatedTx = governanceV3Service.updateRepresentativesForChain(account, [
      { chainId: ChainId.sepolia, representative: 'TODO' },
    ]);

    console.log(populatedTx);
  };

  return (
    <TxActionsWrapper
      requiresApproval={false}
      blocked={false}
      mainTxState={mainTxState}
      preparingTransactions={false}
      handleAction={action}
      actionText="TODO"
      actionInProgressText="TODO"
      isWrongNetwork={false}
    />
  );
};
