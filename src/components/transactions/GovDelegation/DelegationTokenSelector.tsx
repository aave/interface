import { Trans } from '@lingui/macro';
import { Box, FormHelperText, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import * as React from 'react';
import { DelegationToken } from 'src/ui-config/governanceConfig';
import { TokenIcon } from '../../primitives/TokenIcon';
import { ErrorType } from './GovDelegationModalContent';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export type DelegationTokenSelectorProps = {
  delegationTokens: Record<string, DelegationToken>;
  setDelegationToken: React.Dispatch<React.SetStateAction<DelegationToken>>;
  delegationToken: DelegationToken;
  blockingError: ErrorType | undefined;
};

export const DelegationTokenSelector = ({
  delegationTokens,
  setDelegationToken,
  delegationToken,
  blockingError,
}: DelegationTokenSelectorProps) => {
  // render error messages
  const handleError = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return (
          // TODO: fix text
          <Typography>
            <Trans>Not enough balance. Try to delegate another token</Trans>
          </Typography>
        );
      default:
        return null;
    }
  };
  return (
    <div>
      <FormControl sx={{ m: 1, width: 300 }}>
        <Select
          value={delegationToken.symbol}
          onChange={(e) => setDelegationToken(delegationTokens[e.target.value])}
          input={<OutlinedInput />}
          MenuProps={MenuProps}
          native={false}
          error={blockingError !== undefined}
          renderValue={(selectedToken) => {
            return (
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <TokenIcon symbol={selectedToken} sx={{ mx: '4px' }} />
                <Typography>{selectedToken}</Typography>
              </Box>
            );
          }}
        >
          {Object.keys(delegationTokens)
            // .filter((tokenKey) => delegationTokens[tokenKey].symbol !== delegationToken?.symbol)
            .map((tokenKey) => (
              <MenuItem
                key={`delegation-token-${delegationTokens[tokenKey].symbol}`}
                value={delegationTokens[tokenKey].symbol}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <TokenIcon symbol={delegationTokens[tokenKey].symbol} sx={{ mx: '4px' }} />
                    <Typography>{delegationTokens[tokenKey].symbol}</Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
        </Select>
        {blockingError !== undefined && (
          <FormHelperText>
            <Typography variant="helperText" sx={{ color: 'red' }}>
              {handleError()}
            </Typography>
          </FormHelperText>
        )}
      </FormControl>
    </div>
  );
};
