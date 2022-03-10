import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useGasStation } from 'src/hooks/useGasStation';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { GasOption } from '../GasStation/GasStationProvider';
import { Trans } from '@lingui/macro';
import { DelegationType } from 'src/helpers/types';
import { useGovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { TxActionsWrapper } from '../TxActionsWrapper';
import { DelegationToken } from './DelegationTokenSelector';

export type GovDelegationActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  delegationType: DelegationType;
  delegationToken?: DelegationToken;
  delegate: string;
};

export const GovDelegationActions = ({
  isWrongNetwork,
  blocked,
  delegationType,
  delegationToken,
  delegate,
}: GovDelegationActionsProps) => {
  const { governanceDelegationService } = useGovernanceDataProvider();
  const { currentAccount } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return governanceDelegationService.delegateByType({
        user: currentAccount,
        delegatee: delegate,
        delegationType,
        governanceToken: (delegationToken as DelegationToken).address,
      });
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: blocked || !delegationToken?.address,
    deps: [delegate, delegationType, delegationToken?.address],
  });

  // TODO: hash link not working
  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      handleAction={action}
      actionText={<Trans>Delegate</Trans>}
      actionInProgressText={<Trans>Delegating</Trans>}
    />
  );
};
