import { Trans } from '@lingui/macro';
import { Alert, Box, Divider, Tooltip, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { Link } from '../../../components/primitives/Link';
import { TokenIcon } from '../../../components/primitives/TokenIcon';
import { ListColumn } from './ListColumn';

interface ListItemWrapperProps {
  symbol: string;
  iconSymbol: string;
  children: ReactNode;
}

export const ListItemWrapper = ({ symbol, iconSymbol, children }: ListItemWrapperProps) => {
  return (
    <Box>
      <Divider />

      {symbol === 'AMPL' && (
        <Alert severity="warning" sx={{ px: 5 }}>
          <b>Ampleforth</b> is an asset affected by rebasing. Visit the{' '}
          <Link href="https://docs.aave.com/developers/guides/ampl-asset-listing">
            <Trans>documentation</Trans>
          </Link>{' '}
          or{' '}
          <Link href="https://faq.ampleforth.org/lending_and_borrowing">
            <Trans>{"Ampleforth's FAQ"}</Trans>
          </Link>{' '}
          to learn more.
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '71px', px: 4 }}>
        <ListColumn maxWidth={160} isRow>
          <TokenIcon symbol={iconSymbol} fontSize="large" />
          <Tooltip title={symbol} arrow placement="top">
            <Typography variant="subheader1" sx={{ ml: 3 }} noWrap>
              {symbol}
            </Typography>
          </Tooltip>
        </ListColumn>

        {children}
      </Box>
    </Box>
  );
};
