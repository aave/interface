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
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { getMaxGhoMintAmount } from 'src/utils/getMaxAmountAvailableToBorrow';
import { weightedAverageAPY } from 'src/utils/ghoUtilities';
import { isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';

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
  const [ghoUserDataFetched, ghoUserQualifiesForDiscount] = useRootStore((store) => [
    store.ghoUserDataFetched,
    store.ghoUserQualifiesForDiscount,
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

  const { isActive, isFrozen, isPaused, borrowingEnabled } = reserve;
  const maxAmountUserCanMint = Number(getMaxGhoMintAmount(user, reserve));
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
    userDiscountTokenBalance: ghoUserData.userDiscountTokenBalance,
    borrowDisabled:
      !isActive ||
      !borrowingEnabled ||
      isFrozen ||
      isPaused ||
      availableBorrows <= 0 ||
      ghoReserveData.aaveFacilitatorRemainingCapacity < 0.000001,
    showSwitchButton: isFeatureEnabled.debtSwitch(currentMarketData) || false,
    disableSwitch: !isActive || isPaused,
    disableRepay: !isActive || isPaused,
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
  showSwitchButton: boolean;
  disableSwitch: boolean;
  disableRepay: boolean;
  onRepayClick: () => void;
  onBorrowClick: () => void;
  onSwitchClick: () => void;
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
  showSwitchButton,
  disableSwitch,
  disableRepay,
}: GhoBorrowedPositionsListItemProps) => {
  const { symbol, iconSymbol, name, isFrozen, underlyingAsset } = reserve;

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
        {showSwitchButton ? (
          <Button
            disabled={disableSwitch}
            variant="contained"
            onClick={onSwitchClick}
            data-cy={`swapButton`}
          >
            <Trans>Switch</Trans>
          </Button>
        ) : (
          <Button disabled={borrowDisabled} variant="outlined" onClick={onBorrowClick}>
            <Trans>Borrow</Trans>
          </Button>
        )}
        <Button disabled={disableRepay} variant="outlined" onClick={onRepayClick}>
          <Trans>Repay</Trans>
        </Button>
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
  showSwitchButton,
  disableSwitch,
  disableRepay,
}: GhoBorrowedPositionsListItemProps) => {
  const { symbol, iconSymbol, name } = reserve;

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
        {showSwitchButton ? (
          <Button disabled={disableSwitch} variant="contained" fullWidth onClick={onSwitchClick}>
            <Trans>Switch</Trans>
          </Button>
        ) : (
          <Button disabled={borrowDisabled} variant="outlined" onClick={onBorrowClick} fullWidth>
            <Trans>Borrow</Trans>
          </Button>
        )}
        <Button
          disabled={disableRepay}
          variant="outlined"
          onClick={onRepayClick}
          sx={{ mr: 1.5 }}
          fullWidth
        >
          <Trans>Repay</Trans>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  );
};
