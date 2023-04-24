import { DelegationType } from 'src/helpers/types';
import { useGovernanceDelegate } from 'src/helpers/useGovernanceDelegate';

import { DelegationTxsWrapper } from '../DelegationTxsWrapper';
import { DelegationTokenType } from './DelegationTokenSelector';

export type GovDelegationActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  delegationType: DelegationType;
  delegationTokenType: DelegationTokenType;
  delegatee: string;
  isRevoke: boolean;
};

export const GovDelegationActions = ({
  isWrongNetwork,
  blocked,
  delegationType,
  delegationTokenType,
  delegatee,
  isRevoke,
}: GovDelegationActionsProps) => {
  const { signMetaTxs, action, mainTxState, loadingTxns, approvalTxState } = useGovernanceDelegate(
    delegationTokenType,
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
      requiresSignature={delegationTokenType === DelegationTokenType.BOTH}
      blocked={blocked}
      approvalTxState={approvalTxState}
    />
  );
};
