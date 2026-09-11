import { DelegationType } from '@aave/contract-helpers';
import { Box, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { Fragment, useEffect } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { useGovernanceTokens } from 'src/hooks/governance/useGovernanceTokens';

import { TokenIcon } from '../../primitives/TokenIcon';

export type DelegationToken = {
  address: string;
  name: string;
  amount: string;
  symbol: string;
  votingDelegatee?: string;
  propositionDelegatee?: string;
  type: DelegationTokenType;
};

export enum DelegationTokenType {
  ALL = 0,
  AAVE,
  STKAAVE,
  aAave,
}

export type DelegationTokenSelectorProps = {
  delegationTokens: DelegationToken[];
  setDelegationTokenType: (type: DelegationTokenType) => void;
  delegationTokenType: DelegationTokenType;
  delegationType: DelegationType;
  filter: boolean;
};

type TokenRowProps = {
  symbol: string[] | string;
  amount: string | number;
};

export const TokenRow: React.FC<TokenRowProps> = ({ symbol, amount }) => {
  const symbols = Array.isArray(symbol) ? symbol : [symbol];

  return (
    <Row
      align="flex-start"
      sx={{ width: '100%' }}
      captionSx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}
      caption={symbols.map((token, index) => (
        <Fragment key={token}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TokenIcon
              aToken={token === 'aAAVE'}
              symbol={token === 'aAAVE' ? 'aave' : token}
              sx={{ width: 16, height: 16 }}
            />
            <Typography variant="subheader1">{token}</Typography>
          </Box>
          {index < symbols.length - 1 && <Typography variant="subheader1">+</Typography>}
        </Fragment>
      ))}
    >
      <FormattedNumber variant="h5" color="fg-2" value={amount} sx={{ flexShrink: 0 }} />
    </Row>
  );
};

const filterTokens = (
  tokens: DelegationToken[],
  delegationType: DelegationType
): DelegationToken[] => {
  if (delegationType === DelegationType.VOTING) {
    return tokens.filter((token) => token.votingDelegatee !== '');
  } else if (delegationType === DelegationType.PROPOSITION) {
    return tokens.filter((token) => token.propositionDelegatee !== '');
  }
  return tokens.filter(
    (token) => token.propositionDelegatee !== '' || token.votingDelegatee !== ''
  );
};

export const DelegationTokenSelector = ({
  delegationTokens,
  setDelegationTokenType,
  delegationTokenType,
  delegationType,
  filter,
}: DelegationTokenSelectorProps) => {
  const {
    data: { aave, stkAave, aAave },
  } = useGovernanceTokens();

  const filteredTokens = filter ? filterTokens(delegationTokens, delegationType) : delegationTokens;
  const isOneLiner = filter && filteredTokens.length === 1;

  useEffect(() => {
    if (isOneLiner) setDelegationTokenType(filteredTokens[0].type);
  }, [isOneLiner, filteredTokens, setDelegationTokenType]);

  if (isOneLiner) {
    return <TokenRow symbol={filteredTokens[0].symbol} amount={filteredTokens[0].amount} />;
  }

  return (
    <FormControl variant="standard" fullWidth sx={{ mb: 6 }}>
      <RadioGroup
        value={delegationTokenType}
        onChange={(e) =>
          setDelegationTokenType(Number(e.target.value) as unknown as DelegationTokenType)
        }
        sx={{
          '& .MuiFormControlLabel-root': { mr: 0, alignItems: 'flex-start' },
          '& .MuiFormControlLabel-label': { width: '100%', minWidth: 0, mt: '0.5rem' },
        }}
      >
        <FormControlLabel
          value={DelegationTokenType.ALL}
          control={<Radio size="small" />}
          label={
            <TokenRow
              symbol={['AAVE', 'stkAAVE', 'aAAVE']}
              amount={Number(aave) + Number(stkAave) + Number(aAave)}
            />
          }
          data-cy={`delegate-token-both`}
        />
        <FormControlLabel
          value={DelegationTokenType.AAVE}
          control={<Radio size="small" />}
          label={<TokenRow symbol="AAVE" amount={aave} />}
          data-cy={`delegate-token-AAVE`}
        />
        <FormControlLabel
          value={DelegationTokenType.STKAAVE}
          control={<Radio size="small" />}
          label={<TokenRow symbol="stkAAVE" amount={stkAave} />}
          data-cy={`delegate-token-stkAAVE`}
        />
        <FormControlLabel
          value={DelegationTokenType.aAave}
          control={<Radio size="small" />}
          label={<TokenRow symbol="aAAVE" amount={aAave} />}
          data-cy={`delegate-token-aAave`}
        />
      </RadioGroup>
    </FormControl>
  );
};
