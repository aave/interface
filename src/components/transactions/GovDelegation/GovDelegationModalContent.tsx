import { canBeEnsAddress } from '@aave/contract-helpers';
import { t, Trans } from '@lingui/macro';
import { FormControl, TextField, Typography } from '@mui/material';
import { utils } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useState } from 'react';
import { DelegationType } from 'src/helpers/types';
import { useAaveTokensProviderContext } from 'src/hooks/governance-data-provider/AaveTokensDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { GasStation } from '../GasStation/GasStation';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { DelegationToken, DelegationTokenSelector } from './DelegationTokenSelector';
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
  const { chainId: connectedChainId, watchModeOnlyAddress } = useWeb3Context();
  const {
    daveTokens: { aave, stkAave },
  } = useAaveTokensProviderContext();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const { currentNetworkConfig, currentChainId } = useProtocolDataContext();
  // error states

  // selector states
  const [delegationToken, setDelegationToken] = useState<string>('');
  const [delegationType, setDelegationType] = useState(DelegationType.VOTING);
  const [delegate, setDelegate] = useState('');

  const tokens: DelegationToken[] = [
    {
      address: governanceConfig.stkAaveTokenAddress,
      symbol: 'stkAAVE',
      name: 'Staked AAVE',
      amount: stkAave,
    },
    {
      address: governanceConfig.aaveTokenAddress,
      symbol: 'AAVE',
      name: 'AAVE',
      amount: aave,
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
    return <TxSuccessView txHash={txState.txHash || ''} action={<Trans>Delegation</Trans>} />;
  return (
    <>
      <TxModalTitle title="Delegate your power" />
      {isWrongNetwork && !watchModeOnlyAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={govChain} />
      )}
      <Typography variant="description">
        <Trans>Asset to delegate</Trans>
      </Typography>
      <DelegationTokenSelector
        setDelegationToken={setDelegationToken}
        delegationTokenAddress={delegationToken}
        delegationTokens={tokens}
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
      <FormControl error={delegateAddressBlockingError !== undefined} variant="standard" fullWidth>
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
      <GasStation gasLimit={parseUnits(gasLimit || '0', 'wei')} />

      {txError && <GasEstimationError txError={txError} />}

      <GovDelegationActions
        delegationType={delegationType}
        delegationToken={selectedToken}
        delegate={delegate}
        isWrongNetwork={isWrongNetwork}
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
