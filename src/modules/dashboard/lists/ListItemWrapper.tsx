import { Tooltip, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { CustomMarket } from 'src/ui-config/marketsConfig';

import { AMPLWarning } from '../../../components/infoTooltips/AMPLWarning';
import { ListColumn } from '../../../components/lists/ListColumn';
import { ListItem } from '../../../components/lists/ListItem';
import { Link, ROUTES } from '../../../components/primitives/Link';
import { TokenIcon } from '../../../components/primitives/TokenIcon';

interface ListItemWrapperProps {
  symbol: string;
  iconSymbol: string;
  name: string;
  detailsAddress: string;
  children: ReactNode;
  currentMarket: CustomMarket;
}

export const ListItemWrapper = ({
  symbol,
  iconSymbol,
  children,
  name,
  detailsAddress,
  currentMarket,
  ...rest
}: ListItemWrapperProps) => {
  return (
    <ListItem {...rest}>
      <ListColumn maxWidth={160} isRow>
        <Link
          href={ROUTES.reserveOverview(detailsAddress, currentMarket)}
          noWrap
          sx={{ display: 'inline-flex', alignItems: 'center' }}
        >
          <TokenIcon symbol={iconSymbol} fontSize="large" />
          <Tooltip title={`${name} (${symbol})`} arrow placement="top">
            <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
              {symbol}
            </Typography>
          </Tooltip>
        </Link>

        {symbol === 'AMPL' && <AMPLWarning />}
      </ListColumn>

      {children}
    </ListItem>
  );
};
