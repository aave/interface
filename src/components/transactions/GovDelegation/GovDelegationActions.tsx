import { DelegationType } from '@aave/contract-helpers';
import { useGovernanceDelegate } from 'src/helpers/useGovernanceDelegate';

import { DelegationTxsWrapper } from '../DelegationTxsWrapper';
import { DelegationToken } from './DelegationTokenSelector';

export type GovDelegationActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  delegationType: DelegationType;
  delegationTokens: DelegationToken[];
  delegatee: string;
  isRevoke: boolean;
};

export const GovDelegationActions = ({
  isWrongNetwork,
  blocked,
  delegationType,
  delegationTokens,
  delegatee,
  isRevoke,
}: GovDelegationActionsProps) => {
  const { signMetaTxs, action, mainTxState, loadingTxns, approvalTxState } = useGovernanceDelegate(
    delegationTokens,
    delegationType,
    blocked,
    delegatee
  );

  // TODO: hash link not working
  return (
    <DelegationTxsWrapper
      isRevoke={isRevoke}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      handleSignatures={signMetaTxs}
      handleAction={action}
      isWrongNetwork={isWrongNetwork}
      requiresSignature={delegationTokens.length > 1}
      blocked={blocked}
      approvalTxState={approvalTxState}
    />
  );
};
