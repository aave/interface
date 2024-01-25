import { DelegationType } from '@aave/contract-helpers';
import { t, Trans } from '@lingui/macro';
import { FormControl, TextField, Typography } from '@mui/material';
import { constants, utils } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { useGovernanceTokens } from 'src/hooks/governance/useGovernanceTokens';
import { usePowers } from 'src/hooks/governance/usePowers';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ZERO_ADDRESS } from 'src/modules/governance/utils/formatProposal';
import { useRootStore } from 'src/store/root';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { getENSProvider, getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { GasStation } from '../GasStation/GasStation';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import {
  DelegationToken,
  DelegationTokenSelector,
  DelegationTokenType,
} from './DelegationTokenSelector';
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
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const currentChainId = useRootStore((store) => store.currentChainId);
  const {
    data: { aave, stkAave, aAave },
  } = useGovernanceTokens();
  const { data: powers, refetch } = usePowers();
  // error states

  // selector states
  const [delegationTokenType, setDelegationTokenType] = useState<DelegationTokenType[]>([]);
  const [delegationType, setDelegationType] = useState(DelegationType.ALL);
  const [delegate, setDelegate] = useState('');

  const isRevokeModal = type === ModalType.RevokeGovDelegation;

  const onlyOnePowerToRevoke =
    isRevokeModal &&
    !!powers &&
    ((powers.aaveVotingDelegatee === constants.AddressZero &&
      powers.stkAaveVotingDelegatee === constants.AddressZero) ||
      (powers.aavePropositionDelegatee === constants.AddressZero &&
        powers.stkAavePropositionDelegatee === constants.AddressZero));

  useEffect(() => {
    if (onlyOnePowerToRevoke) {
      if (
        powers.aaveVotingDelegatee === constants.AddressZero &&
        powers.stkAaveVotingDelegatee === constants.AddressZero
      )
        setDelegationType(DelegationType.PROPOSITION);
      else setDelegationType(DelegationType.VOTING);
    }
  }, [onlyOnePowerToRevoke, powers]);

  useEffect(() => {
    setDelegate(isRevokeModal ? currentAccount : '');
  }, [isRevokeModal, setDelegate, currentAccount]);

  let tokens: DelegationToken[] = [
    {
      address: governanceV3Config.votingAssets.stkAaveTokenAddress,
      symbol: 'stkAAVE',
      name: 'Staked AAVE',
      domainName: 'Staked Aave',
      amount: stkAave,
      votingDelegatee: powers?.stkAaveVotingDelegatee,
      propositionDelegatee: powers?.stkAavePropositionDelegatee,
      type: DelegationTokenType.STKAAVE,
    },
    {
      address: governanceV3Config.votingAssets.aaveTokenAddress,
      symbol: 'AAVE',
      name: 'AAVE',
      domainName: 'Aave token V3',
      amount: aave,
      votingDelegatee: powers?.aaveVotingDelegatee,
      propositionDelegatee: powers?.aavePropositionDelegatee,
      type: DelegationTokenType.AAVE,
    },
    {
      address: governanceV3Config.votingAssets.aAaveTokenAddress,
      symbol: 'aAAVE',
      name: 'aAAVE',
      domainName: 'Aave Ethereum AAVE',
      amount: aAave,
      votingDelegatee: powers?.aAaveVotingDelegatee,
      propositionDelegatee: powers?.aAavePropositionDelegatee,
      type: DelegationTokenType.aAave,
    },
  ];

  if (isRevokeModal) {
    tokens = tokens.filter((token) => {
      if (delegationType === DelegationType.VOTING) {
        return token.votingDelegatee !== ZERO_ADDRESS;
      } else if (delegationType === DelegationType.PROPOSITION) {
        return token.propositionDelegatee !== ZERO_ADDRESS;
      }

      return token.propositionDelegatee !== ZERO_ADDRESS || token.votingDelegatee !== ZERO_ADDRESS;
    });
  }

  let delegateAddressBlockingError: ErrorType | undefined = undefined;

  const handleDelegateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setDelegate(e.target.value);
    const address = e.target.value;
    if (address.slice(-4) === '.eth') {
      // Attempt to resolve ENS name and use resolved address if valid
      const resolvedAddress = await getENSProvider().resolveName(address);
      if (resolvedAddress && utils.isAddress(resolvedAddress)) {
        setDelegate(resolvedAddress);
      } else {
        delegateAddressBlockingError = ErrorType.NOT_AN_ADDRESS;
      }
    }
  };

  // handle delegate address errors
  if (delegate !== '' && !utils.isAddress(delegate)) {
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
    if (txState.success) refetch();
  }, [txState.success, refetch]);

  const handleSelectedTokensChange = (tokens: DelegationTokenType[]) => {
    setDelegationTokenType(tokens);
  };

  const tokensSelected = tokens.filter((token) => delegationTokenType.includes(token.type));

  // is Network mismatched
  const govChain =
    currentNetworkConfig.isFork &&
    currentNetworkConfig.underlyingChainId === governanceV3Config.coreChainId
      ? currentChainId
      : governanceV3Config.coreChainId;
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
      {(isRevokeModal &&
        !!powers &&
        ((powers.aaveVotingDelegatee === constants.AddressZero &&
          powers.stkAaveVotingDelegatee === constants.AddressZero &&
          powers.aAaveVotingDelegatee === constants.AddressZero) ||
          (powers.aavePropositionDelegatee === constants.AddressZero &&
            powers.stkAavePropositionDelegatee === constants.AddressZero &&
            powers.aAavePropositionDelegatee === constants.AddressZero))) || (
        <>
          <Typography variant="description" color="text.secondary" sx={{ mb: 1 }}>
            <Trans>{isRevokeModal ? 'Power to revoke' : 'Power to delegate'}</Trans>
          </Typography>
          <DelegationTypeSelector
            delegationType={delegationType}
            setDelegationType={setDelegationType}
          />
        </>
      )}

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
          event={{
            eventName: GENERAL.TOOL_TIP,
            eventParams: {
              tooltip: 'Balance to delegate',
              funnel: 'Governance Delegation',
            },
          }}
        >
          <Trans>
            Choose how much voting/proposition power to give to someone else by delegating some of
            your AAVE, stkAAVE or aAAVE balance. Your tokens will remain in your account, but your
            delegate will be able to vote or propose on your behalf. If your AAVE, stkAAVE or aAAVE
            balance changes, your delegate&apos;s voting/proposition power will be automatically
            adjusted.
          </Trans>
        </TextWithTooltip>
      )}

      <DelegationTokenSelector
        delegationTokens={tokens}
        onSelectedTokensChange={handleSelectedTokensChange}
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
              onChange={handleDelegateChange}
              placeholder={t`Enter ETH address`}
              error={delegateAddressBlockingError !== undefined}
              helperText={handleDelegateAddressError()}
              data-cy={`delegationAddress`}
            />
          </FormControl>
        </>
      )}
      <GasStation
        gasLimit={parseUnits(gasLimit || '0', 'wei')}
        chainId={governanceV3Config.coreChainId}
      />

      {txError && <GasEstimationError txError={txError} />}

      <GovDelegationActions
        delegationType={delegationType}
        delegationTokens={tokensSelected}
        delegatee={delegate}
        isWrongNetwork={isWrongNetwork}
        blocked={
          delegateAddressBlockingError !== undefined ||
          delegate === '' ||
          tokensSelected.length === 0
        }
        isRevoke={isRevokeModal}
      />
    </>
  );
};
