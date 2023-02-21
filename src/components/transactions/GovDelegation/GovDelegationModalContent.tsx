import { canBeEnsAddress } from '@aave/contract-helpers';
import { t, Trans } from '@lingui/macro';
import { Box, Button, FormControl, TextField, Typography } from '@mui/material';
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
  const { chainId: connectedChainId, readOnlyModeAddress, currentAccount } = useWeb3Context();
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

  const handleDelegateToSelf = () => {
    setDelegate(currentAccount);
  };

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (txState.success) return <TxSuccessView action={<Trans>Delegation</Trans>} />;
  return (
    <>
      <TxModalTitle title="Set up delegation" />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={govChain} />
      )}
      <Typography variant="description" color="text.secondary" sx={{ mb: 1 }}>
        <Trans>Power to delegate</Trans>
      </Typography>
      <DelegationTypeSelector
        delegationType={delegationType}
        setDelegationType={setDelegationType}
      />

      <Typography variant="description" color="text.secondary" sx={{ mt: 6, mb: 2 }}>
        <Trans>Balance to delegate</Trans>
      </Typography>

      <DelegationTokenSelector
        setDelegationToken={setDelegationToken}
        delegationTokenAddress={delegationToken}
        delegationTokens={tokens}
      />
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="description" color="text.secondary">
          <Trans>Recipient address</Trans>
        </Typography>
        <Button variant="text" onClick={handleDelegateToSelf}>
          <Typography variant="buttonS" color="info.main">
            <Trans>DELEGATE TO SELF</Trans>
          </Typography>
        </Button>
      </Box>
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
