import { t, Trans } from '@lingui/macro';
import {
  CircularProgress,
  FormControlLabel,
  InputBase,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useIsContractAddress } from 'src/hooks/useIsContractAddress';
import { resolveEnsAddress } from 'src/utils/ensClient';
import { figSurfaceShadow } from 'src/utils/figmaColors';
import { isAddress } from 'viem';

export const BridgeDestinationInput = ({
  connectedAccount,
  onInputValid,
  onInputError,
  sourceChainId,
}: {
  connectedAccount: string;
  onInputValid: (destinationAccount: string) => void;
  onInputError: () => void;
  sourceChainId: number;
}) => {
  const { data: isContractAddress, isFetching: fetchingIsContractAddress } = useIsContractAddress(
    connectedAccount,
    sourceChainId
  );

  const [useConnectedAccount, setUseConnectedAccount] = useState(true);
  const [destinationAccount, setDestinationAccount] = useState('');
  const [validatingENS, setValidatingENS] = useState(false);

  useEffect(() => {
    if (isContractAddress === undefined) {
      return;
    }

    if (isContractAddress) {
      setUseConnectedAccount(false);
      setDestinationAccount('');
    } else {
      setUseConnectedAccount(true);
      setDestinationAccount(connectedAccount);
    }
  }, [connectedAccount, isContractAddress]);

  useEffect(() => {
    const checkENS = async () => {
      setValidatingENS(true);
      const resolvedAddress = await resolveEnsAddress(destinationAccount);
      if (resolvedAddress) {
        setDestinationAccount(resolvedAddress.toLowerCase());
      }
      setValidatingENS(false);
    };

    if (!isAddress(destinationAccount)) {
      checkENS();
    }
  }, [destinationAccount]);

  useEffect(() => {
    const validAddress = isAddress(destinationAccount);
    if (validAddress) {
      onInputValid(destinationAccount);
    } else {
      onInputError();
    }
  }, [destinationAccount, onInputError, onInputValid]);

  const showWarning = !useConnectedAccount && !isAddress(destinationAccount);

  return (
    <Stack direction="column" gap="0.5rem" width="100%">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography color="fg-2">
          <Trans>To</Trans>
        </Typography>
        <FormControlLabel
          sx={{ mx: 0 }}
          control={
            <Switch
              disableRipple
              checked={useConnectedAccount}
              onClick={() => {
                const newValue = !useConnectedAccount;
                if (newValue) {
                  setDestinationAccount(connectedAccount);
                  onInputValid(connectedAccount);
                } else {
                  setDestinationAccount('');
                  onInputError();
                }
                setUseConnectedAccount(newValue);
              }}
            />
          }
          labelPlacement="start"
          label={
            <Typography sx={{ fontSize: '0.75rem' }} color="fg-2">
              <Trans>Use connected account</Trans>
            </Typography>
          }
        />
      </Stack>
      <InputBase
        fullWidth
        value={destinationAccount}
        disabled={useConnectedAccount || fetchingIsContractAddress}
        onChange={(e) => setDestinationAccount(e.target.value)}
        placeholder={t`Enter ETH address or ENS`}
        sx={{
          height: '44px',
          px: 2,
          boxShadow: figSurfaceShadow('shadow-stroke-1'),
          borderRadius: '0.5rem',
          overflow: 'hidden',
        }}
        endAdornment={
          validatingENS || fetchingIsContractAddress ? (
            <CircularProgress color="inherit" size="16px" />
          ) : null
        }
      />
      {showWarning && !useConnectedAccount && !fetchingIsContractAddress && (
        <Typography variant="helperText" color="error.main">
          <Trans>Enter a valid address</Trans>
        </Typography>
      )}
    </Stack>
  );
};
