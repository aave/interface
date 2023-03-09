import { Box, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { useEffect } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { DelegationType } from 'src/helpers/types';

import { TokenIcon } from '../../primitives/TokenIcon';

export type DelegationToken = {
  address: string;
  name: string;
  amount: string;
  symbol: string;
  votingDelegatee?: string;
  propositionDelegatee?: string;
};

export type DelegationTokenSelectorProps = {
  delegationTokens: DelegationToken[];
  setDelegationToken: (token: string) => void;
  delegationTokenAddress: string;
  delegationType: DelegationType;
  filter: boolean;
};

export const DelegationTokenSelector = ({
  delegationTokens,
  setDelegationToken,
  delegationTokenAddress,
  delegationType,
  filter,
}: DelegationTokenSelectorProps) => {
  const votingTokensNotSelfDelegated = delegationTokens.filter(
    (token) => token.votingDelegatee !== ''
  );
  const propositionTokensNotSelfDelegated = delegationTokens.filter(
    (token) => token.propositionDelegatee !== ''
  );

  const filteredTokens = delegationTokens.filter(
    (token) => token.propositionDelegatee !== '' || token.votingDelegatee !== ''
  );

  const isFilteredVotingTab =
    filter && delegationType === DelegationType.VOTING && votingTokensNotSelfDelegated.length === 1;
  const isFilteredPropositionTab =
    filter &&
    delegationType === DelegationType.PROPOSITION_POWER &&
    propositionTokensNotSelfDelegated.length === 1;
  const isFilteredBothTab =
    filter && delegationType === DelegationType.BOTH && filteredTokens.length === 1;

  const defaultFilteredVotingTabAddress = votingTokensNotSelfDelegated[0]?.address;
  const defaultFilteredPropositionTabAddress = propositionTokensNotSelfDelegated[0]?.address;

  const defaultFilteredAddress = filteredTokens[0]?.address;

  const defaultAddress = delegationTokens[0]?.address;

  useEffect(() => {
    if (isFilteredVotingTab) setDelegationToken(defaultFilteredVotingTabAddress);
    else if (isFilteredPropositionTab) setDelegationToken(defaultFilteredPropositionTabAddress);
    else if (isFilteredBothTab) setDelegationToken(defaultFilteredAddress);
    else setDelegationToken(defaultAddress);
  }, [
    setDelegationToken,
    isFilteredPropositionTab,
    isFilteredVotingTab,
    isFilteredBothTab,
    defaultFilteredPropositionTabAddress,
    defaultFilteredVotingTabAddress,
    defaultFilteredAddress,
    defaultAddress,
  ]);

  if (isFilteredVotingTab) {
    return (
      <Row
        sx={{ alignItems: 'center', width: '100%' }}
        caption={
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TokenIcon
              symbol={votingTokensNotSelfDelegated[0].symbol}
              sx={{ width: 16, height: 16 }}
            />
            <Typography variant="subheader1">{votingTokensNotSelfDelegated[0].symbol}</Typography>
          </Box>
        }
      >
        <FormattedNumber
          variant="secondary14"
          color="text.secondary"
          value={votingTokensNotSelfDelegated[0].amount}
        />
      </Row>
    );
  }

  if (isFilteredPropositionTab) {
    return (
      <Row
        sx={{ alignItems: 'center', width: '100%' }}
        caption={
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TokenIcon
              symbol={propositionTokensNotSelfDelegated[0].symbol}
              sx={{ width: 16, height: 16 }}
            />
            <Typography variant="subheader1">
              {propositionTokensNotSelfDelegated[0].symbol}
            </Typography>
          </Box>
        }
      >
        <FormattedNumber
          variant="secondary14"
          color="text.secondary"
          value={propositionTokensNotSelfDelegated[0].amount}
        />
      </Row>
    );
  }

  if (isFilteredBothTab) {
    return (
      <Row
        sx={{ alignItems: 'center', width: '100%' }}
        caption={
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TokenIcon symbol={filteredTokens[0].symbol} sx={{ width: 16, height: 16 }} />
            <Typography variant="subheader1">{filteredTokens[0].symbol}</Typography>
          </Box>
        }
      >
        <FormattedNumber
          variant="secondary14"
          color="text.secondary"
          value={filteredTokens[0].amount}
        />
      </Row>
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
              control={<Radio size="small" />}
              componentsProps={{ typography: { width: '100%' } }}
              label={
                <Row
                  data-cy={`delegate-token-${token.symbol}`}
                  sx={{ alignItems: 'center', width: '100%' }}
                  caption={
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <TokenIcon symbol={token.symbol} sx={{ width: 16, height: 16 }} />
                      <Typography variant="subheader1">{token.symbol}</Typography>
                    </Box>
                  }
                >
                  <FormattedNumber
                    variant="secondary14"
                    color="text.secondary"
                    value={token.amount}
                  />
                </Row>
              }
            />
          );
        })}
      </RadioGroup>
    </FormControl>
  );
};
