import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useGasStation } from 'src/hooks/useGasStation';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { GasOption } from '../GasStation/GasStationProvider';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { Trans } from '@lingui/macro';
import { DelegationType } from 'src/helpers/types';
import { DelegationToken } from 'src/ui-config/governanceConfig';
import { useGovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { TxActionsWrapper } from '../TxActionsWrapper';

export type GovDelegationActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  delegationType: DelegationType;
  delegationToken: DelegationToken;
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
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { action, loadingTxns, mainTxState } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return governanceDelegationService.delegateByType({
        user: currentAccount,
        delegatee: delegate,
        delegationType,
        governanceToken: delegationToken.address,
      });
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: blocked,
    deps: [delegate, delegationToken, delegationType],
  });

  // TODO: hash link not working
  return (
    <TxActionsWrapper
      blocked={blocked}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      handleAction={action}
      actionText={<Trans>DELEGATE</Trans>}
      actionInProgressText={<Trans>DELEGATING</Trans>}
      helperText={
        <RightHelperText
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          action="delegation"
        />
      }
    />
  );
};
