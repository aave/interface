import { Trans } from '@lingui/macro';
import { Alert, Tooltip, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { ListColumn } from '../../../components/lists/ListColumn';
import { ListItem } from '../../../components/lists/ListItem';
import { Link } from '../../../components/primitives/Link';
import { TokenIcon } from '../../../components/primitives/TokenIcon';

interface ListItemWrapperProps {
  symbol: string;
  iconSymbol: string;
  children: ReactNode;
}

export const ListItemWrapper = ({
  symbol,
  iconSymbol,
  children,
  ...rest
}: ListItemWrapperProps) => {
  return (
    <ListItem
      warningComponent={
        symbol === 'AMPL' && (
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
        )
      }
      {...rest}
    >
      <ListColumn maxWidth={160} isRow>
        <TokenIcon symbol={iconSymbol} fontSize="large" />
        <Tooltip title={symbol} arrow placement="top">
          <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
            {symbol}
          </Typography>
        </Tooltip>
      </ListColumn>

      {children}
    </ListItem>
  );
};
