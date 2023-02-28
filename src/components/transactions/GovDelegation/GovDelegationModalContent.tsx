import { canBeEnsAddress } from '@aave/contract-helpers';
import { t, Trans } from '@lingui/macro';
import { FormControl, TextField, Typography } from '@mui/material';
import { utils } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { DelegationType } from 'src/helpers/types';
import { useAaveTokensProviderContext } from 'src/hooks/governance-data-provider/AaveTokensDataProvider';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { GasStation } from '../GasStation/GasStation';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { DelegationTokenSelector } from './DelegationTokenSelector';
import { DelegationTypeSelector } from './DelegationTypeSelector';
import { GovDelegationActions } from './GovDelegationActions';

export interface Asset {
  symbol: string;
  icon: string;
  value: number;
  address: string;
}

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
  NOT_AN_ADDRESS,
}

type GovDelegationModalContentProps = {
  type: ModalType.RevokeGovDelegation | ModalType.GovDelegation;
};

export const GovDelegationModalContent: React.FC<GovDelegationModalContentProps> = ({ type }) => {
  const { chainId: connectedChainId, readOnlyModeAddress, currentAccount } = useWeb3Context();
  const {
    daveTokens: { aave, stkAave },
  } = useAaveTokensProviderContext();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const { currentNetworkConfig, currentChainId } = useProtocolDataContext();
  const powers = useRootStore((state) => state.powers);
  const refreshGovernanceData = useRootStore((state) => state.refreshGovernanceData);
  // error states

  // selector states
  const [delegationToken, setDelegationToken] = useState<string>('');
  const [delegationType, setDelegationType] = useState(DelegationType.VOTING);
  const [delegate, setDelegate] = useState('');

  const isRevokeModal = type === ModalType.RevokeGovDelegation;

  useEffect(() => {
    setDelegate(isRevokeModal ? currentAccount : '');
  }, [isRevokeModal, setDelegate, currentAccount]);

  const tokens = [
    {
      address: governanceConfig.stkAaveTokenAddress,
      symbol: 'stkAAVE',
      name: 'Staked AAVE',
      amount: stkAave,
      votingDelegatee: powers?.stkAaveVotingDelegatee,
      propositionDelegatee: powers?.stkAavePropositionDelegatee,
    },
    {
      address: governanceConfig.aaveTokenAddress,
      symbol: 'AAVE',
      name: 'AAVE',
      amount: aave,
      votingDelegatee: powers?.aaveVotingDelegatee,
      propositionDelegatee: powers?.aavePropositionDelegatee,
    },
  ];

  const selectedToken = tokens.find((t) => t.address === delegationToken);

  // handle delegate address errors
  let delegateAddressBlockingError: ErrorType | undefined = undefined;
  if (delegate !== '' && !utils.isAddress(delegate) && !canBeEnsAddress(delegate)) {
    delegateAddressBlockingError = ErrorType.NOT_AN_ADDRESS;
  }

  // render error messages
  const handleDelegateAddressError = () => {
    switch (delegateAddressBlockingError) {
      case ErrorType.NOT_AN_ADDRESS:
        return (
          // TODO: fix text
          <Trans>Not a valid address</Trans>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (txState.success) refreshGovernanceData();
  }, [txState.success, refreshGovernanceData]);

  // is Network mismatched
  const govChain =
    currentNetworkConfig.isFork &&
    currentNetworkConfig.underlyingChainId === governanceConfig.chainId
      ? currentChainId
      : governanceConfig.chainId;
  const isWrongNetwork = connectedChainId !== govChain;

  const networkConfig = getNetworkConfig(govChain);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (txState.success)
    return <TxSuccessView action={<Trans>{isRevokeModal ? 'Revoke' : 'Delegation'}</Trans>} />;
  return (
    <>
      <TxModalTitle title={isRevokeModal ? 'Revoke power' : 'Set up delegation'} />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={govChain} />
      )}
      <Typography variant="description" color="text.secondary" sx={{ mb: 1 }}>
        <Trans>{isRevokeModal ? 'Power to revoke' : 'Power to delegate'}</Trans>
      </Typography>
      <DelegationTypeSelector
        disableVoting={
          isRevokeModal &&
          !!powers &&
          powers.aaveVotingDelegatee === '' &&
          powers.stkAaveVotingDelegatee === ''
        }
        disableProposing={
          isRevokeModal &&
          !!powers &&
          powers.aavePropositionDelegatee === '' &&
          powers.stkAavePropositionDelegatee === ''
        }
        delegationType={delegationType}
        setDelegationType={setDelegationType}
      />

      {isRevokeModal ? (
        <Typography variant="description" color="text.secondary" sx={{ mt: 6, mb: 2 }}>
          <Trans>Balance to revoke</Trans>
        </Typography>
      ) : (
        <TextWithTooltip
          text="Balance to delegate"
          variant="description"
          textColor="text.secondary"
          wrapperProps={{ mt: 6, mb: 2 }}
        >
          <Trans>
            Choose how much voting/proposition power to give to someone else by delegating some of
            your AAVE or stkAAVE balance. Your tokens will remain in your account, but your delegate
            will be able to vote or propose on your behalf. If your AAVE or stkAAVE balance changes,
            your delegate&apos;s voting/proposition power will be automatically adjusted.
          </Trans>
        </TextWithTooltip>
      )}

      <DelegationTokenSelector
        setDelegationToken={setDelegationToken}
        delegationTokenAddress={delegationToken}
        delegationTokens={tokens}
        delegationType={delegationType}
        filter={isRevokeModal}
      />
      {!isRevokeModal && (
        <>
          <Typography variant="description" color="text.secondary" mb={1}>
            <Trans>Recipient address</Trans>
          </Typography>
          <FormControl
            error={delegateAddressBlockingError !== undefined}
            variant="standard"
            fullWidth
          >
            <TextField
              variant="outlined"
              fullWidth
              value={delegate}
              onChange={(e) => setDelegate(e.target.value)}
              placeholder={t`Enter ETH address`}
              error={delegateAddressBlockingError !== undefined}
              helperText={handleDelegateAddressError()}
            />
          </FormControl>
        </>
      )}
      <GasStation gasLimit={parseUnits(gasLimit || '0', 'wei')} />

      {txError && <GasEstimationError txError={txError} />}

      <GovDelegationActions
        delegationType={delegationType}
        delegationToken={selectedToken}
        delegate={delegate}
        isWrongNetwork={isWrongNetwork}
        actionText={isRevokeModal ? <Trans>Revoke</Trans> : <Trans>Delegate</Trans>}
        actionInProgressText={isRevokeModal ? <Trans>Revoking</Trans> : <Trans>Delegating</Trans>}
        blocked={
          delegateAddressBlockingError !== undefined ||
          delegate === '' ||
          !delegationType ||
          !selectedToken
        }
      />
    </>
  );
};
