import { Trans } from '@lingui/macro';
import { Box, Button, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { CapType } from 'src/components/caps/helper';
import { GhoIncentivesCard } from 'src/components/incentives/GhoIncentivesCard';
import { AvailableTooltip } from 'src/components/infoTooltips/AvailableTooltip';
import { FixedAPYTooltip } from 'src/components/infoTooltips/FixedAPYTooltip';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { DASHBOARD_LIST_COLUMN_WIDTHS } from 'src/utils/dashboardSortUtils';
import { getMaxGhoMintAmount } from 'src/utils/getMaxAmountAvailableToBorrow';
import { weightedAverageAPY } from 'src/utils/ghoUtilities';

import { Link, ROUTES } from '../../../../components/primitives/Link';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { ListValueRow } from '../ListValueRow';
import { GhoBorrowAssetsItem } from './types';

export const GhoBorrowAssetsListItem = ({
  symbol,
  iconSymbol,
  name,
  underlyingAsset,
  isFreezed,
}: GhoBorrowAssetsItem) => {
  const { openBorrow } = useModalContext();
  const { user } = useAppDataContext();
  const { currentMarket } = useProtocolDataContext();
  const { ghoReserveData, ghoUserData, ghoLoadingData } = useAppDataContext();
  const { ghoUserDataFetched } = useRootStore();
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  // Available borrows is min of user available borrows and remaining facilitator capacity
  const maxAmountUserCanMint = Number(getMaxGhoMintAmount(user));
  const availableBorrows = Math.min(
    maxAmountUserCanMint,
    ghoReserveData.aaveFacilitatorRemainingCapacity
  );
  const borrowButtonDisable = isFreezed || availableBorrows <= 0;
  const debtBalanceAfterMaxBorrow = availableBorrows + ghoUserData.userGhoBorrowBalance;

  // Determine borrow APY range
  const userCurrentBorrowApy = weightedAverageAPY(
    ghoReserveData.ghoVariableBorrowAPY,
    ghoUserData.userGhoBorrowBalance,
    ghoUserData.userGhoAvailableToBorrowAtDiscount,
    ghoReserveData.ghoBorrowAPYWithMaxDiscount
  );
  const userBorrowApyAfterNewBorrow = weightedAverageAPY(
    ghoReserveData.ghoVariableBorrowAPY,
    debtBalanceAfterMaxBorrow,
    ghoUserData.userGhoAvailableToBorrowAtDiscount,
    ghoReserveData.ghoBorrowAPYWithMaxDiscount
  );
  const ghoApyRange: [number, number] | undefined = ghoUserDataFetched
    ? [
        ghoUserData.userGhoAvailableToBorrowAtDiscount === 0
          ? ghoReserveData.ghoBorrowAPYWithMaxDiscount
          : userCurrentBorrowApy,
        userBorrowApyAfterNewBorrow,
      ]
    : undefined;

  const props: GhoBorrowAssetsListItemProps = {
    symbol,
    iconSymbol,
    name,
    underlyingAsset,
    currentMarket,
    availableBorrows,
    borrowButtonDisable,
    userDiscountTokenBalance: ghoUserData.userDiscountTokenBalance,
    ghoApyRange,
    ghoUserDataFetched,
    userBorrowApyAfterNewBorrow,
    ghoLoadingData,
    onBorrowClick: () => openBorrow(underlyingAsset, currentMarket, name, 'dashboard'),
  };
  if (downToXSM) {
    return <GhoBorrowAssetsListItemMobile {...props} />;
  } else {
    return <GhoBorrowAssetsListItemDesktop {...props} />;
  }
};

interface GhoBorrowAssetsListItemProps {
  symbol: string;
  iconSymbol: string;
  name: string;
  underlyingAsset: string;
  currentMarket: CustomMarket;
  availableBorrows: number;
  borrowButtonDisable: boolean;
  userDiscountTokenBalance: number;
  ghoApyRange: [number, number] | undefined;
  ghoUserDataFetched: boolean;
  userBorrowApyAfterNewBorrow: number;
  ghoLoadingData: boolean;
  onBorrowClick: () => void;
}

const GhoBorrowAssetsListItemDesktop = ({
  symbol,
  iconSymbol,
  name,
  underlyingAsset,
  currentMarket,
  availableBorrows,
  borrowButtonDisable,
  userDiscountTokenBalance,
  ghoApyRange,
  ghoUserDataFetched,
  userBorrowApyAfterNewBorrow,
  onBorrowClick,
}: GhoBorrowAssetsListItemProps) => {
  return (
    <ListItem
      sx={{ borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', mb: 2 }}
      data-cy={`dashboardBorrowListItem_${symbol.toUpperCase()}`}
    >
      <ListColumn maxWidth={DASHBOARD_LIST_COLUMN_WIDTHS.CELL} isRow>
        <Link
          href={ROUTES.reserveOverview(underlyingAsset, currentMarket)}
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
      </ListColumn>
      <ListColumn>
        <Box display="flex" flexDirection="column">
          <AvailableTooltip
            capType={CapType.borrowCap}
            text={<Trans>Available</Trans>}
            variant="subheader2"
            color="text.secondary"
            ml={-1}
          />
          <ListValueColumn
            listColumnProps={{
              p: 0,
            }}
            symbol={symbol}
            value={availableBorrows}
            subValue={availableBorrows}
            disabled={availableBorrows === 0}
            withTooltip
          />
        </Box>
      </ListColumn>
      <ListColumn flex={2} p={2}>
        <FixedAPYTooltip
          text={<Trans>APY, fixed rate</Trans>}
          variant="subheader2"
          color="text.secondary"
        />
        <GhoIncentivesCard
          withTokenIcon={true}
          useApyRange
          rangeValues={ghoApyRange}
          value={ghoUserDataFetched ? userBorrowApyAfterNewBorrow : -1}
          data-cy={`apyType`}
          stkAaveBalance={userDiscountTokenBalance}
          ghoRoute={ROUTES.reserveOverview(underlyingAsset, currentMarket) + '/#discount'}
          forceShowTooltip
          userQualifiesForDiscount
        />
      </ListColumn>
      <ListButtonsColumn>
        <Button disabled={borrowButtonDisable} variant="contained" onClick={onBorrowClick}>
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
    </ListItem>
  );
};

const GhoBorrowAssetsListItemMobile = ({
  symbol,
  iconSymbol,
  name,
  underlyingAsset,
  currentMarket,
  availableBorrows,
  borrowButtonDisable,
  userDiscountTokenBalance,
  ghoApyRange,
  ghoLoadingData,
  userBorrowApyAfterNewBorrow,
  onBorrowClick,
}: GhoBorrowAssetsListItemProps) => {
  return (
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      currentMarket={currentMarket}
    >
      <ListValueRow
        title={<Trans>Available to borrow</Trans>}
        value={availableBorrows}
        subValue={availableBorrows}
        disabled={availableBorrows === 0}
      />

      <Row
        caption={
          <FixedAPYTooltip
            text={<Trans>APY, fixed rate</Trans>}
            key="APY_dash_mob_variable_ type"
            variant="description"
          />
        }
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <GhoIncentivesCard
          withTokenIcon={true}
          useApyRange
          rangeValues={ghoApyRange}
          value={ghoLoadingData ? -1 : userBorrowApyAfterNewBorrow}
          data-cy="apyType"
          stkAaveBalance={userDiscountTokenBalance}
          ghoRoute={ROUTES.reserveOverview(underlyingAsset, currentMarket) + '/#discount'}
          forceShowTooltip
          userQualifiesForDiscount
        />
      </Row>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        <Button
          disabled={borrowButtonDisable}
          variant="contained"
          onClick={onBorrowClick}
          sx={{ mr: 1.5 }}
          fullWidth
        >
          <Trans>Borrow</Trans>
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(underlyingAsset, currentMarket)}
          fullWidth
        >
          <Trans>Details</Trans>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  );
};
