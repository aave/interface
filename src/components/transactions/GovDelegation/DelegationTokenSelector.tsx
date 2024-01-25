import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';

import { TokenIcon } from '../../primitives/TokenIcon';

export type DelegationToken = {
  address: string;
  name: string;
  domainName: string;
  amount: string;
  symbol: string;
  votingDelegatee?: string;
  propositionDelegatee?: string;
  type: DelegationTokenType;
};

export enum DelegationTokenType {
  AAVE,
  STKAAVE,
  aAave,
}

export type DelegationTokenSelectorProps = {
  delegationTokens: DelegationToken[];
  onSelectedTokensChange: (tokens: DelegationTokenType[]) => void;
};

type TokenRowProps = {
  symbol: string[] | string;
  amount: string | number;
};

export const TokenRow: React.FC<TokenRowProps> = ({ symbol, amount }) => {
  return (
    <Row
      sx={{ alignItems: 'center', width: '100%' }}
      caption={
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {Array.isArray(symbol) ? (
            symbol.map((token, index) => (
              <>
                <TokenIcon
                  aToken={token === 'aAAVE'}
                  symbol={token === 'aAAVE' ? 'aave' : token}
                  sx={{ width: 16, height: 16 }}
                />
                <Typography variant="subheader1">{token}</Typography>
                {index < symbol.length - 1 && <Typography variant="subheader1">+</Typography>}
              </>
            ))
          ) : (
            <>
              <TokenIcon
                aToken={symbol === 'aAAVE'}
                symbol={symbol === 'aAAVE' ? 'aave' : symbol}
                sx={{ width: 16, height: 16 }}
              />
              <Typography variant="subheader1">{symbol}</Typography>
            </>
          )}
        </Box>
      }
    >
      <FormattedNumber variant="secondary14" color="text.secondary" value={amount} />
    </Row>
  );
};

export const DelegationTokenSelector = ({
  delegationTokens,
  onSelectedTokensChange,
}: DelegationTokenSelectorProps) => {
  const [selectedTokens, setSelectedTokens] = useState<DelegationTokenType[]>([]);

  const handleTokenSelect = (type: DelegationTokenType) => {
    let tempSelectedTokens = [...selectedTokens];
    if (selectedTokens.includes(type)) {
      tempSelectedTokens = tempSelectedTokens.filter((token) => token !== type);
    } else {
      tempSelectedTokens.push(type);
    }

    onSelectedTokensChange(tempSelectedTokens);
    setSelectedTokens(tempSelectedTokens);
  };

  return (
    <FormControl variant="standard" fullWidth sx={{ mb: 6 }}>
      {delegationTokens.map((token) => (
        <FormControlLabel
          key={token.symbol}
          value={token.type}
          control={
            <Checkbox
              size="small"
              checked={selectedTokens.includes(token.type)}
              onChange={() => handleTokenSelect(token.type)}
            />
          }
          componentsProps={{ typography: { width: '100%' } }}
          label={<TokenRow symbol={token.symbol} amount={token.amount} />}
          data-cy={`delegate-token-${token.symbol}`}
        />
      ))}
    </FormControl>
  );
};
