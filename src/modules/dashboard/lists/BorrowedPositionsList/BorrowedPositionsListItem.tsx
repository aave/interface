import { InterestRate } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Trans } from '@lingui/macro';
import { Box, Button, useMediaQuery, useTheme } from '@mui/material';
import { IncentivesCard } from 'src/components/incentives/IncentivesCard';
import { APYTypeTooltip } from 'src/components/infoTooltips/APYTypeTooltip';
import { Row } from 'src/components/primitives/Row';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';

import { ListColumn } from '../../../../components/lists/ListColumn';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemAPYButton } from '../ListItemAPYButton';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { ListValueRow } from '../ListValueRow';

export const BorrowedPositionsListItem = ({ item }: { item: DashboardReserve }) => {
  const { borrowCap } = useAssetCaps();
  const { currentMarket, currentMarketData } = useProtocolDataContext();
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const { openBorrow, openRepay, openRateSwitch, openDebtSwitch } = useModalContext();

  const reserve = item.reserve;

  const disableBorrow =
    !reserve.isActive || !reserve.borrowingEnabled || reserve.isFrozen || borrowCap.isMaxed;

  const showSwitchButton = isFeatureEnabled.debtSwitch(currentMarketData) || false;
  const disableSwitch = !reserve.isActive || reserve.symbol == 'stETH';

  const props: BorrowedPositionsListItemProps = {
    ...item,
    disableBorrow,
    disableSwitch,
    showSwitchButton,
    totalBorrows:
      item.borrowRateMode === InterestRate.Variable ? item.variableBorrows : item.stableBorrows,
    totalBorrowsUSD:
      item.borrowRateMode === InterestRate.Variable
        ? item.variableBorrowsUSD
        : item.stableBorrowsUSD,
    borrowAPY:
      item.borrowRateMode === InterestRate.Variable
        ? Number(reserve.variableBorrowAPY)
        : Number(reserve.stableBorrowAPY),
    incentives:
      item.borrowRateMode === InterestRate.Variable
        ? reserve.vIncentivesData
        : reserve.sIncentivesData,
    onDetbSwitchClick: () => {
      openDebtSwitch(reserve.underlyingAsset, item.borrowRateMode);
    },
    onOpenBorrow: () => {
      openBorrow(reserve.underlyingAsset, currentMarket, reserve.name, 'dashboard');
    },
    onOpenRepay: () => {
      openRepay(
        reserve.underlyingAsset,
        item.borrowRateMode,
        reserve.isFrozen,
        currentMarket,
        reserve.name,
        'dashboard'
      );
    },
    onOpenRateSwitch: () => {
      openRateSwitch(reserve.underlyingAsset, item.borrowRateMode);
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
  showSwitchButton: boolean;
  borrowAPY: number;
  incentives: ReserveIncentiveResponse[] | undefined;
  onDetbSwitchClick: () => void;
  onOpenBorrow: () => void;
  onOpenRepay: () => void;
  onOpenRateSwitch: () => void;
}

const BorrowedPositionsListItemDesktop = ({
  reserve,
  borrowRateMode,
  disableBorrow,
  disableSwitch,
  showSwitchButton,
  totalBorrows,
  totalBorrowsUSD,
  borrowAPY,
  incentives,
  onDetbSwitchClick,
  onOpenBorrow,
  onOpenRepay,
  onOpenRateSwitch,
}: BorrowedPositionsListItemProps) => {
  const { currentMarket } = useProtocolDataContext();

  const { isActive, isFrozen, stableBorrowRateEnabled, name } = reserve;

  return (
    <ListItemWrapper
      symbol={reserve.symbol}
      iconSymbol={reserve.iconSymbol}
      name={name}
      detailsAddress={reserve.underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      borrowEnabled={reserve.borrowingEnabled}
      data-cy={`dashboardBorrowedListItem_${reserve.symbol.toUpperCase()}_${borrowRateMode}`}
      showBorrowCapTooltips
    >
      <ListValueColumn symbol={reserve.symbol} value={totalBorrows} subValue={totalBorrowsUSD} />

      <ListAPRColumn value={borrowAPY} incentives={incentives} symbol={reserve.symbol} />

      <ListColumn>
        <ListItemAPYButton
          stableBorrowRateEnabled={stableBorrowRateEnabled}
          borrowRateMode={borrowRateMode}
          disabled={!stableBorrowRateEnabled || isFrozen || !isActive}
          onClick={onOpenRateSwitch}
          stableBorrowAPY={reserve.stableBorrowAPY}
          variableBorrowAPY={reserve.variableBorrowAPY}
          underlyingAsset={reserve.underlyingAsset}
          currentMarket={currentMarket}
        />
      </ListColumn>

      <ListButtonsColumn>
        <Button disabled={!isActive} variant="contained" onClick={onOpenRepay}>
          <Trans>Repay</Trans>
        </Button>
        {showSwitchButton ? (
          <Button
            disabled={disableSwitch}
            variant="outlined"
            onClick={onDetbSwitchClick}
            data-cy={`swapButton`}
          >
            <Trans>Switch</Trans>
          </Button>
        ) : (
          <Button disabled={disableBorrow} variant="outlined" onClick={onOpenBorrow}>
            <Trans>Borrow</Trans>
          </Button>
        )}
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};

const BorrowedPositionsListItemMobile = ({
  reserve,
  borrowRateMode,
  totalBorrows,
  totalBorrowsUSD,
  disableBorrow,
  showSwitchButton,
  disableSwitch,
  borrowAPY,
  incentives,
  onDetbSwitchClick,
  onOpenBorrow,
  onOpenRepay,
  onOpenRateSwitch,
}: BorrowedPositionsListItemProps) => {
  const { currentMarket } = useProtocolDataContext();

  const {
    symbol,
    iconSymbol,
    name,
    isActive,
    isFrozen,
    stableBorrowRateEnabled,
    variableBorrowAPY,
    stableBorrowAPY,
    underlyingAsset,
  } = reserve;

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
    >
      <ListValueRow
        title={<Trans>Debt</Trans>}
        value={totalBorrows}
        subValue={totalBorrowsUSD}
        disabled={Number(totalBorrows) === 0}
      />

      <Row caption={<Trans>APY</Trans>} align="flex-start" captionVariant="description" mb={2}>
        <IncentivesCard
          value={borrowAPY}
          incentives={incentives}
          symbol={symbol}
          variant="secondary14"
        />
      </Row>

      <Row
        caption={
          <APYTypeTooltip text={<Trans>APY type</Trans>} key="APY type" variant="description" />
        }
        captionVariant="description"
        mb={2}
      >
        <ListItemAPYButton
          stableBorrowRateEnabled={stableBorrowRateEnabled}
          borrowRateMode={borrowRateMode}
          disabled={!stableBorrowRateEnabled || isFrozen || !isActive}
          onClick={onOpenRateSwitch}
          stableBorrowAPY={stableBorrowAPY}
          variableBorrowAPY={variableBorrowAPY}
          underlyingAsset={underlyingAsset}
          currentMarket={currentMarket}
        />
      </Row>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        <Button
          disabled={!isActive}
          variant="contained"
          onClick={onOpenRepay}
          sx={{ mr: 1.5 }}
          fullWidth
        >
          <Trans>Repay</Trans>
        </Button>
        {showSwitchButton ? (
          <Button
            disabled={disableSwitch}
            variant="outlined"
            fullWidth
            onClick={onDetbSwitchClick}
            data-cy={`swapButton`}
          >
            <Trans>Switch</Trans>
          </Button>
        ) : (
          <Button disabled={disableBorrow} variant="outlined" onClick={onOpenBorrow} fullWidth>
            <Trans>Borrow</Trans>
          </Button>
        )}
      </Box>
    </ListMobileItemWrapper>
  );
};
