import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Trans } from '@lingui/macro';
import { Box, Button, useMediaQuery, useTheme } from '@mui/material';
import { MeritIncentivesButton } from 'src/components/incentives/IncentivesButton';
import { IncentivesCard } from 'src/components/incentives/IncentivesCard';
import { Row } from 'src/components/primitives/Row';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';
import { showExternalIncentivesTooltip } from 'src/utils/utils';

import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { ListValueRow } from '../ListValueRow';
import { BorrowedPositionsListItemWrapperProps } from './BorrowedPositionsListItemWrapper';

export const BorrowedPositionsListItem = ({
  item,
  disableEModeSwitch,
}: BorrowedPositionsListItemWrapperProps) => {
  const { borrowCap } = useAssetCaps();
  const { currentMarket, currentMarketData } = useProtocolDataContext();
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const { openBorrow, openRepay, openDebtSwitch } = useModalContext();

  const reserve = item.reserve;

  const disableBorrow =
    !reserve.isActive ||
    !reserve.borrowingEnabled ||
    reserve.isFrozen ||
    reserve.isPaused ||
    borrowCap.isMaxed;

  const disableRepay = !reserve.isActive || reserve.isPaused;

  const showSwitchButton = !!isFeatureEnabled.debtSwitch(currentMarketData);
  const disableSwitch =
    reserve.isPaused || !reserve.isActive || reserve.symbol == 'stETH' || disableEModeSwitch;

  const props: BorrowedPositionsListItemProps = {
    ...item,
    disableBorrow,
    disableSwitch,
    disableRepay,
    showSwitchButton,
    totalBorrows: item.variableBorrows,
    totalBorrowsUSD: item.variableBorrowsUSD,
    borrowAPY: Number(reserve.variableBorrowAPY),
    incentives: reserve.vIncentivesData,
    onDetbSwitchClick: () => {
      openDebtSwitch(reserve.underlyingAsset);
    },
    onOpenBorrow: () => {
      openBorrow(reserve.underlyingAsset, currentMarket, reserve.name, 'dashboard');
    },
    onOpenRepay: () => {
      openRepay(
        reserve.underlyingAsset,
        reserve.isFrozen,
        currentMarket,
        reserve.name,
        'dashboard'
      );
    },
  };

  if (downToXSM) {
    return <BorrowedPositionsListItemMobile {...props} />;
  } else {
    return <BorrowedPositionsListItemDesktop {...props} />;
  }
};

interface BorrowedPositionsListItemProps extends DashboardReserve {
  disableBorrow: boolean;
  disableSwitch: boolean;
  disableRepay: boolean;
  showSwitchButton: boolean;
  borrowAPY: number;
  incentives: ReserveIncentiveResponse[] | undefined;
  onDetbSwitchClick: () => void;
  onOpenBorrow: () => void;
  onOpenRepay: () => void;
}

const BorrowedPositionsListItemDesktop = ({
  reserve,
  disableBorrow,
  disableSwitch,
  disableRepay,
  showSwitchButton,
  totalBorrows,
  totalBorrowsUSD,
  borrowAPY,
  incentives,
  onDetbSwitchClick,
  onOpenBorrow,
  onOpenRepay,
}: BorrowedPositionsListItemProps) => {
  const { currentMarket } = useProtocolDataContext();

  return (
    <ListItemWrapper
      symbol={reserve.symbol}
      iconSymbol={reserve.iconSymbol}
      name={reserve.name}
      detailsAddress={reserve.underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      paused={reserve.isPaused}
      borrowEnabled={reserve.borrowingEnabled}
      data-cy={`dashboardBorrowedListItem_${reserve.symbol.toUpperCase()}`}
      showBorrowCapTooltips
      showExternalIncentivesTooltips={showExternalIncentivesTooltip(
        reserve.symbol,
        currentMarket,
        ProtocolAction.borrow
      )}
    >
      <ListValueColumn symbol={reserve.symbol} value={totalBorrows} subValue={totalBorrowsUSD} />

      <ListAPRColumn
        value={borrowAPY}
        market={currentMarket}
        protocolAction={ProtocolAction.borrow}
        incentives={incentives}
        symbol={reserve.symbol}
      />

      <ListButtonsColumn>
        {showSwitchButton ? (
          <Button
            disabled={disableSwitch}
            variant="contained"
            onClick={onDetbSwitchClick}
            data-cy={`swapButton`}
          >
            <Trans>Switch</Trans>
          </Button>
        ) : (
          <Button disabled={disableBorrow} variant="contained" onClick={onOpenBorrow}>
            <Trans>Borrow</Trans>
          </Button>
        )}
        <Button disabled={disableRepay} variant="outlined" onClick={onOpenRepay}>
          <Trans>Repay</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};

const BorrowedPositionsListItemMobile = ({
  reserve,
  totalBorrows,
  totalBorrowsUSD,
  disableBorrow,
  showSwitchButton,
  disableSwitch,
  borrowAPY,
  incentives,
  disableRepay,
  onDetbSwitchClick,
  onOpenBorrow,
  onOpenRepay,
}: BorrowedPositionsListItemProps) => {
  const { currentMarket } = useProtocolDataContext();

  const { symbol, iconSymbol, name } = reserve;

  return (
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={reserve.underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      borrowEnabled={reserve.borrowingEnabled}
      showBorrowCapTooltips
      showExternalIncentivesTooltips={showExternalIncentivesTooltip(
        symbol,
        currentMarket,
        ProtocolAction.borrow
      )}
    >
      <ListValueRow
        title={<Trans>Debt</Trans>}
        value={totalBorrows}
        subValue={totalBorrowsUSD}
        disabled={Number(totalBorrows) === 0}
      />

      <Row caption={<Trans>APY</Trans>} align="flex-start" captionVariant="description" mb={2}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <IncentivesCard
            value={borrowAPY}
            incentives={incentives}
            symbol={symbol}
            variant="secondary14"
          />
          <MeritIncentivesButton
            symbol={symbol}
            market={currentMarket}
            protocolAction={ProtocolAction.borrow}
          />
        </Box>
      </Row>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        {showSwitchButton ? (
          <Button
            disabled={disableSwitch}
            variant="contained"
            fullWidth
            onClick={onDetbSwitchClick}
            data-cy={`swapButton`}
          >
            <Trans>Switch</Trans>
          </Button>
        ) : (
          <Button disabled={disableBorrow} variant="contained" onClick={onOpenBorrow} fullWidth>
            <Trans>Borrow</Trans>
          </Button>
        )}
        <Button
          disabled={disableRepay}
          variant="outlined"
          onClick={onOpenRepay}
          sx={{ ml: 1.5 }}
          fullWidth
        >
          <Trans>Repay</Trans>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  );
};
