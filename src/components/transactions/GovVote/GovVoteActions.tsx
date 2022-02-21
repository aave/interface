import { Trans } from '@lingui/macro';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useGovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { useGasStation } from 'src/hooks/useGasStation';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { GasOption } from '../GasStation/GasStationProvider';
import { TxActionsWrapper } from '../TxActionsWrapper';

export type GovVoteActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  proposalId: number;
  support: boolean;
};

export const GovVoteActions = ({
  isWrongNetwork,
  blocked,
  proposalId,
  support,
}: GovVoteActionsProps) => {
  const { governanceService } = useGovernanceDataProvider();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { action, loadingTxns, mainTxState } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return governanceService.submitVote({
        proposalId: Number(proposalId),
        user: currentAccount,
        support: support || false,
      });
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: blocked,
    deps: [],
  });

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={support ? <Trans>VOTE YAE</Trans> : <Trans>VOTE NAY</Trans>}
      actionInProgressText={support ? <Trans>VOTE YAE</Trans> : <Trans>VOTE NAY</Trans>}
      isWrongNetwork={isWrongNetwork}
      helperText={
        <RightHelperText actionHash={mainTxState.txHash} chainId={connectedChainId} action="vote" />
      }
    />
  );
};
