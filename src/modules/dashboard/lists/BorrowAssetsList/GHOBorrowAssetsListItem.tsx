import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { GHODiscountButton } from 'src/components/gho/GHODiscountButton';
import { GHOBorrowRateTooltip } from 'src/components/infoTooltips/GHOBorrowRateTooltip';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import { Link, ROUTES } from '../../../../components/primitives/Link';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { GHOBorrowAssetsItem } from './types';

export const GHOBorrowAssetsListItem = ({
  symbol,
  iconSymbol,
  name,
  baseVariableBorrowRate,
  vIncentivesData,
  underlyingAsset,
  isFreezed,
  userAvailableBorrows,
}: GHOBorrowAssetsItem) => {
  const { openBorrow } = useModalContext();
  const { currentMarket } = useProtocolDataContext();
  const borrowButtonDisable = isFreezed || Number(userAvailableBorrows) <= 0; // TO-DO: Factor in facilitator cap
  const availableBorrows = Number(userAvailableBorrows);

  return (
    <ListItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      detailsAddress={underlyingAsset}
      data-cy={`dashboardBorrowListItem_${symbol.toUpperCase()}`}
      currentMarket={currentMarket}
      footerButton={<GHODiscountButton />}
    >
      <ListValueColumn
        symbol={symbol}
        value={availableBorrows} // TO-DO: Factor in facilitator cap
        subValue={availableBorrows}
        disabled={availableBorrows === 0}
        withTooltip
      />

      <ListAPRColumn
        value={Number(baseVariableBorrowRate) / 10 ** 27} // TO-DO: Net APY factoring in discount
        incentives={vIncentivesData}
        symbol={symbol}
        tooltip={<GHOBorrowRateTooltip />}
      />
      <ListAPRColumn value={0} incentives={[]} symbol={symbol} />

      <ListButtonsColumn>
        <Button
          disabled={borrowButtonDisable}
          variant="contained"
          onClick={() => openBorrow(underlyingAsset)}
        >
          <Trans>Borrow</Trans>
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(underlyingAsset, currentMarket)}
        >
          <Trans>Details</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
