import { canBeEnsAddress } from '@aave/contract-helpers';
import { Trans, t } from '@lingui/macro';
import { FormControl, FormHelperText, Input, Typography } from '@mui/material';
import { ethers } from 'ethers';
import { useState } from 'react';
import { DelegationType } from 'src/helpers/types';
import { useAaveTokensProviderContext } from 'src/hooks/governance-data-provider/AaveTokensDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import {
  DelegationToken,
  delegationTokens,
  governanceConfig,
} from 'src/ui-config/governanceConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
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

export const GovDelegationModalContent = () => {
  const { chainId: connectedChainId } = useWeb3Context();
  const {
    daveTokens: { aave, stkAave },
  } = useAaveTokensProviderContext();
  const { gasLimit, mainTxState: txState } = useModalContext();

  // error states

  // selector states
  const [delegationToken, setDelegationToken] = useState<DelegationToken>(delegationTokens['AAVE']);
  const [delegationType, setDelegationType] = useState(DelegationType.VOTING);
  const [delegate, setDelegate] = useState('');

  let tokenBlockingError: ErrorType | undefined = undefined;
  if (delegationToken.symbol === 'AAVE' && aave === '0') {
    tokenBlockingError = ErrorType.NOT_ENOUGH_BALANCE;
  } else if (delegationToken.symbol === 'stkAAVE' && stkAave === '0') {
    tokenBlockingError = ErrorType.NOT_ENOUGH_BALANCE;
  }

  // handle delegate address errors
  let delegateAddressBlockingError: ErrorType | undefined = undefined;
  if (delegate !== '' && !ethers.utils.isAddress(delegate) && !canBeEnsAddress(delegate)) {
    delegateAddressBlockingError = ErrorType.NOT_AN_ADDRESS;
  }

  // render error messages
  const handleDelegateAddressError = () => {
    switch (delegateAddressBlockingError) {
      case ErrorType.NOT_AN_ADDRESS:
        return (
          // TODO: fix text
          <Typography>
            <Trans>Not a valid address</Trans>
          </Typography>
        );
      default:
        return null;
    }
  };
  const handleTokenBlockingError = () => {
    switch (tokenBlockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return (
          // TODO: fix text
          <Typography>
            <Trans>Not enough balance</Trans>
          </Typography>
        );
      default:
        return null;
    }
  };

  // is Network mismatched
  const govChain = governanceConfig?.chainId || 1;
  const networkConfig = getNetworkConfig(govChain);
  const isWrongNetwork = connectedChainId !== govChain;

  if (txState.txError) return <TxErrorView errorMessage={txState.txError} />;
  if (txState.success) return <TxSuccessView action="Delegation" />;
  return (
    <>
      <TxModalTitle title="Delegate your power" />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={govChain} />
      )}
      <Typography variant="description">
        <Trans>Asset to delegate</Trans>
      </Typography>
      <DelegationTokenSelector
        setDelegationToken={setDelegationToken}
        delegationToken={delegationToken}
        delegationTokens={delegationTokens}
        blockingError={tokenBlockingError}
      />
      <Typography variant="description">
        <Trans>Type of delegation</Trans>
      </Typography>
      <DelegationTypeSelector
        delegationType={delegationType}
        setDelegationType={setDelegationType}
      />
      <Typography variant="description">
        <Trans>Recipient address</Trans>
      </Typography>
      <FormControl error={delegateAddressBlockingError !== undefined} variant="standard">
        <Input
          value={delegate}
          onChange={(e) => setDelegate(e.target.value)}
          placeholder={t`Enter Eth address`}
          error={delegateAddressBlockingError !== undefined}
        />
        {delegateAddressBlockingError !== undefined && (
          <FormHelperText>
            <Typography variant="helperText" sx={{ color: 'red' }}>
              {handleDelegateAddressError()}
            </Typography>
          </FormHelperText>
        )}
        {tokenBlockingError !== undefined && (
          <FormHelperText>
            <Typography variant="helperText" sx={{ color: 'red' }}>
              {handleTokenBlockingError()}
            </Typography>
          </FormHelperText>
        )}
      </FormControl>
      <TxModalDetails gasLimit={gasLimit} />

      {txState.gasEstimationError && <GasEstimationError error={txState.gasEstimationError} />}

      <GovDelegationActions
        delegationType={delegationType}
        delegationToken={delegationToken}
        delegate={delegate}
        isWrongNetwork={isWrongNetwork}
        blocked={
          tokenBlockingError !== undefined ||
          delegateAddressBlockingError !== undefined ||
          delegate === ''
        }
      />
    </>
  );
};
