import { canBeEnsAddress } from '@aave/contract-helpers';
import { Select, Trans, t } from '@lingui/macro';
import {
  Button,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  Link,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { DelegationType, TxState } from 'src/helpers/types';
import { useAaveTokensProviderContext } from 'src/hooks/governance-data-provider/AaveTokensDataProvider';
import { useVotingPower } from 'src/hooks/governance-data-provider/useVotingPower';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
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

export type GovDelegationModalContentProps = {
  handleClose: () => void;
};

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

export const GovDelegationModalContent = ({ handleClose }: GovDelegationModalContentProps) => {
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();
  const {
    daveTokens: { aave, stkAave },
  } = useAaveTokensProviderContext();

  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [txState, setTxState] = useState<TxState>({ success: false });

  // error states
  const [tokenBlockingError, setTokenBlockingError] = useState<ErrorType>();
  const [delegateAddressBlockingError, setDelegateAddressBlockingError] = useState<
    ErrorType | undefined
  >();

  // selector states
  const [delegationToken, setDelegationToken] = useState<DelegationToken>(delegationTokens['AAVE']);
  const [delegationType, setDelegationType] = useState(DelegationType.VOTING);
  const [delegate, setDelegate] = useState('');

  useEffect(() => {
    if (delegationToken.symbol === 'AAVE' && aave === '0') {
      setTokenBlockingError(ErrorType.NOT_ENOUGH_BALANCE);
    } else if (delegationToken.symbol === 'stkAAVE' && stkAave === '0') {
      setTokenBlockingError(ErrorType.NOT_ENOUGH_BALANCE);
    } else {
      setTokenBlockingError(undefined);
    }
  }, [delegationToken, aave, stkAave]);

  // handle delegate address errors
  useEffect(() => {
    if (delegate !== '' && !ethers.utils.isAddress(delegate) && !canBeEnsAddress(delegate)) {
      setDelegateAddressBlockingError(ErrorType.NOT_AN_ADDRESS);
    } else {
      setDelegateAddressBlockingError(undefined);
    }
  }, [delegate]);
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

  console.log('token blocking:: ', tokenBlockingError);

  // is Network mismatched
  const govChain = governanceConfig?.chainId || 1;
  const networkConfig = getNetworkConfig(govChain);
  const isWrongNetwork = connectedChainId !== govChain;

  return (
    <>
      {!txState.txError && !txState.success && (
        <>
          <TxModalTitle title="Governance delegation" />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={govChain} />
          )}
          <Typography variant="description">
            <Trans>Asset</Trans>
          </Typography>
          <DelegationTokenSelector
            setDelegationToken={setDelegationToken}
            delegationToken={delegationToken}
            delegationTokens={delegationTokens}
            blockingError={tokenBlockingError}
          />
          <Typography variant="description">
            <Trans>Type</Trans>
          </Typography>
          <DelegationTypeSelector
            delegationType={delegationType}
            setDelegationType={setDelegationType}
          />
          <Typography variant="description">
            <Trans>Delegation to address</Trans>
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
          </FormControl>
          <TxModalDetails gasLimit={gasLimit} />
        </>
      )}

      {txState.txError && <TxErrorView errorMessage={txState.txError} />}
      {txState.success && !txState.txError && <TxSuccessView action="Delegation" />}
      {txState.gasEstimationError && <GasEstimationError error={txState.gasEstimationError} />}

      {/* <GovDelegationActions
        setGasLimit={setGasLimit}
        setEmodeTxState={setEmodeTxState}
        handleClose={handleClose}
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined}
        selectedEmode={selectedEmode?.id || 0}
      /> */}
    </>
  );
};
