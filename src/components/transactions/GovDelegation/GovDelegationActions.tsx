import { ProtocolAction } from '@aave/contract-helpers';
import { utils } from 'ethers';
import { ReactNode, useState } from 'react';
import { DelegationType } from 'src/helpers/types';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useRootStore } from 'src/store/root';
import { governanceConfig } from 'src/ui-config/governanceConfig';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { DelegationTokenType } from './DelegationTokenSelector';

export type GovDelegationActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  delegationType: DelegationType;
  delegationTokenType: DelegationTokenType;
  delegatee: string;
  actionText: ReactNode;
  actionInProgressText: ReactNode;
};

export const GovDelegationActions = ({
  isWrongNetwork,
  blocked,
  delegationType,
  delegationTokenType,
  delegatee,
  actionText,
  actionInProgressText,
}: GovDelegationActionsProps) => {
  const delegateByType = useRootStore((state) => state.delegateByType);
  const delegate = useRootStore((state) => state.delegate);
  const getTokenNonce = useRootStore((state) => state.getTokenNonce);
  const delegateTokensBySig = useRootStore((state) => state.delegateTokensBySig);
  const user = useRootStore((state) => state.account);
  const [aaveNonce, setAaveNonce] = useState(0);
  const [stkAaveNonce, setStkAaveNonce] = useState(0);

  const { action, loadingTxns, mainTxState, requiresApproval, approvalTxState, approval } =
    useTransactionHandler({
      handleGetTxns: async () => {
        if (delegationTokenType === DelegationTokenType.BOTH) {
          if (delegationType === DelegationType.BOTH) {
            const aaveDelegate = await delegate({
              delegatee,
              governanceToken: governanceConfig.aaveTokenAddress,
            });
            const stkAaveDelegate = await delegate({
              delegatee,
              governanceToken: governanceConfig.stkAaveTokenAddress,
            });
            return [aaveDelegate[0], stkAaveDelegate[0]];
          } else {
            const aaveDelegateByType = await delegateByType({
              delegatee,
              delegationType,
              governanceToken: governanceConfig.aaveTokenAddress,
            });
            const sktAaveDelegateByType = await delegateByType({
              delegatee,
              delegationType,
              governanceToken: governanceConfig.stkAaveTokenAddress,
            });
            return [aaveDelegateByType[0], sktAaveDelegateByType[0]];
          }
        } else {
          if (delegationType === DelegationType.BOTH) {
            return delegate({
              delegatee,
              governanceToken:
                delegationTokenType === DelegationTokenType.AAVE
                  ? governanceConfig.aaveTokenAddress
                  : governanceConfig.stkAaveTokenAddress,
            });
          }
          return delegateByType({
            delegatee,
            delegationType,
            governanceToken:
              delegationTokenType === DelegationTokenType.AAVE
                ? governanceConfig.aaveTokenAddress
                : governanceConfig.stkAaveTokenAddress,
          });
        }
      },
      handleGetPermitTxns: async (signatures, deadline) => {
        const { v: v1, r: r1, s: s1 } = utils.splitSignature(signatures[0]);
        const { v: v2, r: r2, s: s2 } = utils.splitSignature(signatures[1]);
        return delegateTokensBySig({
          user,
          tokens: [governanceConfig.aaveTokenAddress, governanceConfig.stkAaveTokenAddress],
          data: [
            {
              delegatee,
              nonce: aaveNonce,
              expiry: deadline,
              signature: {
                v: v1,
                r: r1,
                s: s1,
              },
            },
            {
              delegatee,
              nonce: stkAaveNonce,
              expiry: deadline,
              signature: {
                v: v2,
                r: r2,
                s: s2,
              },
            },
          ],
        });
      },
      tryPermit: delegationTokenType === DelegationTokenType.BOTH,
      skip: blocked,
      permitAction: ProtocolAction.default,
      deps: [delegatee, delegationType, delegationTokenType],
    });

  const handleApproval = async () => {
    const aaveNonce = await getTokenNonce(user, governanceConfig.aaveTokenAddress);
    const stkAaveNonce = await getTokenNonce(user, governanceConfig.stkAaveTokenAddress);
    setAaveNonce(aaveNonce);
    setStkAaveNonce(stkAaveNonce);
    return approval([
      {
        delegatee,
        nonce: String(aaveNonce),
        permitType: 'DELEGATE',
        governanceToken: governanceConfig.aaveTokenAddress,
        governanceTokenName: 'AAVE',
      },
      {
        delegatee,
        nonce: String(stkAaveNonce),
        permitType: 'DELEGATE',
        governanceToken: governanceConfig.stkAaveTokenAddress,
        governanceTokenName: 'stkAAVE',
      },
    ]);
  };

  // TODO: hash link not working
  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      handleAction={action}
      actionText={actionText}
      actionInProgressText={actionInProgressText}
      tryPermit
      handleApproval={handleApproval}
      approvalTxState={approvalTxState}
    />
  );
};
