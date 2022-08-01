import { Tooltip, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { MaxSuppliedTooltip } from 'src/components/infoTooltips/MaxSuppliedTooltip';
import { MaxBorrowedTooltip } from 'src/components/infoTooltips/MaxBorrowedTooltip';
import { MaxDebtCeilingTooltip } from 'src/components/infoTooltips/MaxDebtCeilingTooltip';
import { CustomMarket } from 'src/ui-config/marketsConfig';

import { AMPLWarning } from '../../../components/infoTooltips/AMPLWarning';
import { FrozenWarning } from '../../../components/infoTooltips/FrozenWarning';
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
  frozen?: boolean;
  supplyCapReached?: boolean;
  borrowCapReached?: boolean;
  debtCeilingReached?: boolean;
}

export const ListItemWrapper = ({
  symbol,
  iconSymbol,
  children,
  name,
  detailsAddress,
  currentMarket,
  frozen,
  supplyCapReached = false,
  borrowCapReached = false,
  debtCeilingReached = false,
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
        {supplyCapReached && <MaxSuppliedTooltip />}
        {borrowCapReached && <MaxBorrowedTooltip />}
        {debtCeilingReached && <MaxDebtCeilingTooltip />}
        {frozen && <FrozenWarning symbol={symbol} />}
        {!frozen && symbol === 'AMPL' && <AMPLWarning />}
      </ListColumn>

      {children}
    </ListItem>
  );
};
