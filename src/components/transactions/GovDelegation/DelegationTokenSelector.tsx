import { Box, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { useEffect } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

import { TokenIcon } from '../../primitives/TokenIcon';

export type DelegationToken = { address: string; name: string; amount: string; symbol: string };

export type DelegationTokenSelectorProps = {
  delegationTokens: DelegationToken[];
  setDelegationToken: (token: string) => void;
  delegationTokenAddress: string;
};

export const DelegationTokenSelector = ({
  delegationTokens,
  setDelegationToken,
  delegationTokenAddress,
}: DelegationTokenSelectorProps) => {
  const tokensWithBalance = delegationTokens.filter((elem) => elem.amount != '0');

  useEffect(() => {
    if (tokensWithBalance.length === 1) setDelegationToken(tokensWithBalance[0].address);
  }, [tokensWithBalance, setDelegationToken]);

  if (tokensWithBalance.length === 1) {
    const selectedToken = tokensWithBalance[0];
    return (
      <Box sx={{ display: 'flex', gap: 2, mb: 6 }}>
        <TokenIcon symbol={selectedToken.symbol} />
        <FormattedNumber value={selectedToken.amount} variant="main16" />
      </Box>
    );
  }

  return (
    <FormControl variant="standard" fullWidth sx={{ mb: 6 }}>
      <RadioGroup
        value={delegationTokenAddress}
        onChange={(e) => setDelegationToken(e.target.value)}
      >
        {delegationTokens.map((token) => {
          return (
            <FormControlLabel
              value={token.address}
              key={token.address}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormattedNumber variant="subheader1" value={token.amount} />
                  <Typography variant="description" color="text.secondary">
                    {token.symbol}
                  </Typography>
                </Box>
              }
            />
          );
        })}
      </RadioGroup>
    </FormControl>
  );
};
