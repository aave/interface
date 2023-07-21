import { InterestRate } from '@aave/contract-helpers';
import { InformationCircleIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, useMediaQuery, useTheme } from '@mui/material';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { GhoIncentivesCard } from 'src/components/incentives/GhoIncentivesCard';
import { FixedAPYTooltipText } from 'src/components/infoTooltips/FixedAPYTooltip';
import { ROUTES } from 'src/components/primitives/Link';
import { Row } from 'src/components/primitives/Row';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { TrackEventProperties } from 'src/store/analyticsSlice';
import { useRootStore } from 'src/store/root';
import { CustomMarket, MarketDataType } from 'src/ui-config/marketsConfig';
import { getMaxGhoMintAmount } from 'src/utils/getMaxAmountAvailableToBorrow';
import { weightedAverageAPY } from 'src/utils/ghoUtilities';
import { isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { ListColumn } from '../../../../components/lists/ListColumn';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  useAppDataContext,
} from '../../../../hooks/app-data-provider/useAppDataProvider';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { ListValueRow } from '../ListValueRow';

export const GhoBorrowedPositionsListItem = ({
  reserve,
  borrowRateMode,
}: ComputedUserReserveData & { borrowRateMode: InterestRate }) => {
  const { openBorrow, openRepay, openDebtSwitch } = useModalContext();
  const { currentMarket, currentMarketData } = useProtocolDataContext();
  const { ghoLoadingData, ghoReserveData, ghoUserData, user } = useAppDataContext();
  const [ghoUserDataFetched, ghoUserQualifiesForDiscount, trackEvent] = useRootStore((store) => [
    store.ghoUserDataFetched,
    store.ghoUserQualifiesForDiscount,
    store.trackEvent,
  ]);
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const discountableAmount =
    ghoUserData.userGhoBorrowBalance >= ghoReserveData.ghoMinDebtTokenBalanceForDiscount
      ? ghoUserData.userGhoAvailableToBorrowAtDiscount
      : 0;
  const borrowRateAfterDiscount = weightedAverageAPY(
    ghoReserveData.ghoVariableBorrowAPY,
    ghoUserData.userGhoBorrowBalance,
    discountableAmount,
    ghoReserveData.ghoBorrowAPYWithMaxDiscount
  );

  const hasDiscount = ghoUserQualifiesForDiscount();

  const { isActive, isFrozen, borrowingEnabled } = reserve;
  const maxAmountUserCanMint = Number(getMaxGhoMintAmount(user));
  const availableBorrows = Math.min(
    maxAmountUserCanMint,
    ghoReserveData.aaveFacilitatorRemainingCapacity
  );

  const props: GhoBorrowedPositionsListItemProps = {
    reserve,
    borrowRateMode,
    userGhoBorrowBalance: ghoUserData.userGhoBorrowBalance,
    hasDiscount,
    ghoLoadingData,
    ghoUserDataFetched,
    borrowRateAfterDiscount,
    currentMarket,
    currentMarketData,
    userDiscountTokenBalance: ghoUserData.userDiscountTokenBalance,
    borrowDisabled:
      !isActive ||
      !borrowingEnabled ||
      isFrozen ||
      availableBorrows <= 0 ||
      ghoReserveData.aaveFacilitatorRemainingCapacity < 0.000001,
    onRepayClick: () =>
      openRepay(
        reserve.underlyingAsset,
        borrowRateMode,
        isFrozen,
        currentMarket,
        reserve.name,
        'dashboard'
      ),
    onBorrowClick: () =>
      openBorrow(reserve.underlyingAsset, currentMarket, reserve.name, 'dashboard'),
    onSwitchClick: () => openDebtSwitch(reserve.underlyingAsset, borrowRateMode),
    trackEvent,
  };

  if (downToXSM) {
    return <GhoBorrowedPositionsListItemMobile {...props} />;
  } else {
    return <GhoBorrowedPositionsListItemDesktop {...props} />;
  }
};

interface GhoBorrowedPositionsListItemProps {
  reserve: ComputedReserveData;
  borrowRateMode: InterestRate;
  userGhoBorrowBalance: number;
  hasDiscount: boolean;
  ghoLoadingData: boolean;
  ghoUserDataFetched: boolean;
  borrowRateAfterDiscount: number;
  currentMarket: CustomMarket;
  userDiscountTokenBalance: number;
  borrowDisabled: boolean;
  currentMarketData: MarketDataType;
  onRepayClick: () => void;
  onBorrowClick: () => void;
  onSwitchClick: () => void;
  trackEvent: (eventName: string, properties?: TrackEventProperties) => void;
}

const GhoBorrowedPositionsListItemDesktop = ({
  reserve,
  borrowRateMode,
  userGhoBorrowBalance,
  hasDiscount,
  ghoLoadingData,
  ghoUserDataFetched,
  borrowRateAfterDiscount,
  currentMarket,
  userDiscountTokenBalance,
  borrowDisabled,
  onRepayClick,
  onBorrowClick,
  onSwitchClick,
  currentMarketData,
  trackEvent,
}: GhoBorrowedPositionsListItemProps) => {
  const { symbol, iconSymbol, name, isActive, isFrozen, underlyingAsset } = reserve;
  const showSwitchButton = isFeatureEnabled.debtSwitch(currentMarketData);
  const disableSwitch = !isActive || isFrozen;

  return (
    <ListItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      detailsAddress={underlyingAsset}
      currentMarket={currentMarket}
      frozen={isFrozen}
      data-cy={`dashboardBorrowedListItem_${symbol.toUpperCase()}_${borrowRateMode}`}
      showBorrowCapTooltips
    >
      <ListValueColumn
        symbol={symbol}
        value={userGhoBorrowBalance}
        subValue={userGhoBorrowBalance}
      />
      <ListColumn>
        <GhoIncentivesCard
          withTokenIcon={hasDiscount}
          value={ghoLoadingData || !ghoUserDataFetched ? -1 : borrowRateAfterDiscount}
          data-cy={`apyType`}
          stkAaveBalance={userDiscountTokenBalance}
          ghoRoute={ROUTES.reserveOverview(underlyingAsset, currentMarket) + '/#discount'}
          userQualifiesForDiscount={hasDiscount}
        />
      </ListColumn>
      <ListColumn>
        <ContentWithTooltip tooltipContent={FixedAPYTooltipText} offset={[0, -4]} withoutHover>
          <Button
            variant="outlined"
            size="small"
            color="primary"
            disabled
            data-cy={`apyButton_fixed`}
          >
            FIXED RATE
            <SvgIcon sx={{ marginLeft: '2px', fontSize: '14px' }}>
              <InformationCircleIcon />
            </SvgIcon>
          </Button>
        </ContentWithTooltip>
      </ListColumn>
      <ListButtonsColumn>
        <Button disabled={!isActive} variant="contained" onClick={onRepayClick}>
          <Trans>Repay</Trans>
        </Button>
        {showSwitchButton ? (
          <Button
            disabled={disableSwitch}
            variant="outlined"
            onClick={() => {
              trackEvent(GENERAL.OPEN_MODAL, {
                modal: 'Debt Switch',
                market: currentMarket,
                assetName: reserve.name,
                asset: reserve.underlyingAsset,
              });
              onSwitchClick();
            }}
            data-cy={`swapButton`}
          >
            <Trans>Switch</Trans>
          </Button>
        ) : (
          <Button disabled={borrowDisabled} variant="outlined" onClick={onBorrowClick}>
            <Trans>Borrow</Trans>
          </Button>
        )}
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};

const GhoBorrowedPositionsListItemMobile = ({
  reserve,
  userGhoBorrowBalance,
  hasDiscount,
  ghoLoadingData,
  borrowRateAfterDiscount,
  currentMarket,
  userDiscountTokenBalance,
  borrowDisabled,
  onRepayClick,
  onBorrowClick,
  onSwitchClick,
  currentMarketData,
  trackEvent,
}: GhoBorrowedPositionsListItemProps) => {
  const { symbol, iconSymbol, name, isActive, isFrozen } = reserve;
  const showSwitchButton = isFeatureEnabled.debtSwitch(currentMarketData);
  const disableSwitch = !isActive || isFrozen || symbol == 'stETH';

  return (
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={reserve.underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      showBorrowCapTooltips
    >
      <ListValueRow
        title={<Trans>Debt</Trans>}
        value={userGhoBorrowBalance}
        subValue={userGhoBorrowBalance}
        disabled={userGhoBorrowBalance === 0}
      />
      <Row caption={<Trans>APY</Trans>} align="flex-start" captionVariant="description" mb={2}>
        <GhoIncentivesCard
          withTokenIcon={hasDiscount}
          value={ghoLoadingData ? -1 : borrowRateAfterDiscount}
          data-cy={`apyType`}
          stkAaveBalance={userDiscountTokenBalance}
          ghoRoute={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket) + '/#discount'}
          userQualifiesForDiscount={hasDiscount}
        />
      </Row>
      <Row caption={<Trans>APY type</Trans>} captionVariant="description" mb={2}>
        <ContentWithTooltip tooltipContent={FixedAPYTooltipText} offset={[0, -4]} withoutHover>
          <Button variant="outlined" size="small" color="primary">
            FIXED RATE
            <SvgIcon sx={{ marginLeft: '2px', fontSize: '14px' }}>
              <InformationCircleIcon />
            </SvgIcon>
          </Button>
        </ContentWithTooltip>
      </Row>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        <Button
          disabled={!isActive}
          variant="contained"
          onClick={onRepayClick}
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
            onClick={() => {
              trackEvent(GENERAL.OPEN_MODAL, {
                modal: 'Debt Switch',
                market: currentMarket,
                assetName: reserve.name,
                asset: reserve.underlyingAsset,
              });
              onSwitchClick();
            }}
          >
            <Trans>Switch</Trans>
          </Button>
        ) : (
          <Button disabled={borrowDisabled} variant="outlined" onClick={onBorrowClick} fullWidth>
            <Trans>Borrow</Trans>
          </Button>
        )}
      </Box>
    </ListMobileItemWrapper>
  );
};
