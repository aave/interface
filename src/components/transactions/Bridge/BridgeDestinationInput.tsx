import { t, Trans } from '@lingui/macro';
import {
  CircularProgress,
  FormControlLabel,
  InputBase,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { isAddress } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { useIsContractAddress } from 'src/hooks/useIsContractAddress';
import { getENSProvider } from 'src/utils/marketsAndNetworksConfig';

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
      const resolvedAddress = await getENSProvider().resolveName(destinationAccount);
      if (resolvedAddress) {
        setDestinationAccount(resolvedAddress.toLowerCase());
      }
      setValidatingENS(false);
    };

    if (destinationAccount.slice(-4) === '.eth') {
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
    <Stack direction="column" gap={1} width="100%">
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography color="text.secondary">
          <Trans>To</Trans>
        </Typography>
        <Stack direction="row" alignItems="center" sx={{ mb: -1 }}>
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
              <Typography sx={{ fontSize: '0.75rem' }} color="text.secondary">
                <Trans>Use connected account</Trans>
              </Typography>
            }
          />
        </Stack>
      </Stack>
      <InputBase
        fullWidth
        value={destinationAccount}
        disabled={useConnectedAccount || fetchingIsContractAddress}
        onChange={(e) => setDestinationAccount(e.target.value)}
        placeholder={t`Enter ETH address or ENS`}
        sx={(theme) => ({
          height: '44px',
          px: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '6px',
          overflow: 'hidden',
        })}
        endAdornment={
          validatingENS || fetchingIsContractAddress ? (
            <CircularProgress color="inherit" size="16px" />
          ) : null
        }
      />
      <Typography
        sx={{
          visibility:
            useConnectedAccount || fetchingIsContractAddress
              ? 'hidden'
              : showWarning
              ? 'visible'
              : 'hidden',
        }}
        variant="helperText"
        color="error.main"
      >
        <Trans>Enter a valid address</Trans>
      </Typography>
    </Stack>
  );
};
