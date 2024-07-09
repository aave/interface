import { Tooltip, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { BorrowDisabledToolTip } from 'src/components/infoTooltips/BorrowDisabledToolTip';
import { OffboardingTooltip } from 'src/components/infoTooltips/OffboardingToolTip';
import { PausedTooltip } from 'src/components/infoTooltips/PausedTooltip';
import { StETHCollateralToolTip } from 'src/components/infoTooltips/StETHCollateralToolTip';
import { SuperFestTooltip } from 'src/components/infoTooltips/SuperFestTooltip';
import { AssetsBeingOffboarded } from 'src/components/Warnings/OffboardingWarning';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { DASHBOARD_LIST_COLUMN_WIDTHS } from 'src/utils/dashboardSortUtils';
import { DASHBOARD } from 'src/utils/mixPanelEvents';

import { AMPLToolTip } from '../../../components/infoTooltips/AMPLToolTip';
import { FrozenTooltip } from '../../../components/infoTooltips/FrozenTooltip';
import { RenFILToolTip } from '../../../components/infoTooltips/RenFILToolTip';
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
  paused?: boolean;
  borrowEnabled?: boolean;
  showSupplyCapTooltips?: boolean;
  showBorrowCapTooltips?: boolean;
  showDebtCeilingTooltips?: boolean;
  showSuperFestTooltip?: boolean;
}

export const ListItemWrapper = ({
  symbol,
  iconSymbol,
  children,
  name,
  detailsAddress,
  currentMarket,
  frozen,
  paused,
  borrowEnabled = true,
  showSupplyCapTooltips = false,
  showBorrowCapTooltips = false,
  showDebtCeilingTooltips = false,
  showSuperFestTooltip = false,
  ...rest
}: ListItemWrapperProps) => {
  const { supplyCap, borrowCap, debtCeiling } = useAssetCaps();

  const showFrozenTooltip = frozen && symbol !== 'renFIL' && symbol !== 'BUSD';
  const showRenFilTooltip = frozen && symbol === 'renFIL';
  const showAmplTooltip = !frozen && symbol === 'AMPL';
  const showstETHTooltip = symbol == 'stETH';
  const offboardingDiscussion = AssetsBeingOffboarded[currentMarket]?.[symbol];
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
        {paused && <PausedTooltip />}
        {showSuperFestTooltip && <SuperFestTooltip />}
        {showFrozenTooltip && <FrozenTooltip symbol={symbol} currentMarket={currentMarket} />}
        {showRenFilTooltip && <RenFILToolTip />}
        {showAmplTooltip && <AMPLToolTip />}
        {showstETHTooltip && <StETHCollateralToolTip />}
        {offboardingDiscussion && <OffboardingTooltip discussionLink={offboardingDiscussion} />}
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
