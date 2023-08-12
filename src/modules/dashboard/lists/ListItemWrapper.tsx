import { Tooltip, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { BorrowDisabledToolTip } from 'src/components/infoTooltips/BorrowDisabledToolTip';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { DASHBOARD_LIST_COLUMN_WIDTHS } from 'src/utils/dashboardSortUtils';
import { DASHBOARD } from 'src/utils/mixPanelEvents';

import { FrozenTooltip } from '../../../components/infoTooltips/FrozenTooltip';
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
  borrowEnabled?: boolean;
  showSupplyCapTooltips?: boolean;
  showBorrowCapTooltips?: boolean;
  showDebtCeilingTooltips?: boolean;
}

export const ListItemWrapper = ({
  symbol,
  iconSymbol,
  children,
  name,
  detailsAddress,
  currentMarket,
  frozen,
  borrowEnabled = true,
  showSupplyCapTooltips = false,
  showBorrowCapTooltips = false,
  showDebtCeilingTooltips = false,
  ...rest
}: ListItemWrapperProps) => {
  const { supplyCap, borrowCap, debtCeiling } = useAssetCaps();

  const showFrozenTooltip = frozen && symbol !== 'renFIL' && symbol !== 'BUSD';
  // const showRenFilTooltip = frozen && symbol === 'renFIL';
  // const showAmplTooltip = !frozen && symbol === 'AMPL';
  // const showstETHTooltip = symbol == 'stETH';
  // const showBUSDOffBoardingTooltip = symbol == 'BUSD';
  const showBorrowDisabledTooltip = !frozen && !borrowEnabled;
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <ListItem {...rest}>
      <ListColumn maxWidth={DASHBOARD_LIST_COLUMN_WIDTHS.CELL} isRow>
        <Link
          onClick={() =>
            trackEvent(DASHBOARD.DETAILS_NAVIGATION, {
              type: 'Row click',
              market: currentMarket,
              assetName: name,
              asset: detailsAddress,
            })
          }
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
        {showFrozenTooltip && <FrozenTooltip symbol={symbol} currentMarket={currentMarket} />}
        {showBorrowDisabledTooltip && (
          <BorrowDisabledToolTip symbol={symbol} currentMarket={currentMarket} />
        )}
        {showSupplyCapTooltips && supplyCap.displayMaxedTooltip({ supplyCap })}
        {showBorrowCapTooltips && borrowCap.displayMaxedTooltip({ borrowCap })}
        {showDebtCeilingTooltips && debtCeiling.displayMaxedTooltip({ debtCeiling })}
      </ListColumn>
      {children}
    </ListItem>
  );
};
