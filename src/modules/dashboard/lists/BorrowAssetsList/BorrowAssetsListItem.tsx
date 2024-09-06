import { Trans } from '@lingui/macro';
import { Button, useTheme } from '@mui/material';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { DASHBOARD } from 'src/utils/mixPanelEvents';
import { showSuperFestTooltip, Side } from 'src/utils/utils';

import { CapsHint } from '../../../../components/caps/CapsHint';
import { CapType } from '../../../../components/caps/helper';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';

export const BorrowAssetsListItem = ({
  symbol,
  iconSymbol,
  name,
  availableBorrows,
  availableBorrowsInUSD,
  borrowCap,
  totalBorrows,
  variableBorrowRate,
  vIncentivesData,
  underlyingAsset,
  isFreezed,
  image,
  totalScaledVariableDebt,
  priceInUSD,
}: DashboardReserve) => {
  const { openBorrow } = useModalContext();
  const { currentMarket } = useProtocolDataContext();
  const theme = useTheme();

  const disableBorrow = isFreezed || Number(availableBorrows) <= 0;

  const trackEvent = useRootStore((store) => store.trackEvent);

  const checkAvailableValue = (
    availableBorrows: number,
    borrowCap: number,
    totalScaledVariableDebt: number
  ) => {
    return availableBorrows > 0
      ? Math.min(availableBorrows, borrowCap) - totalScaledVariableDebt
      : 0;
  };

  const checkAvailableUSDValue = (
    availableBorrowsInUSD: number,
    borrowCap: number,
    totalScaledVariableDebt: number
  ) => {
    return availableBorrowsInUSD > 0
      ? Math.min(availableBorrowsInUSD, borrowCap) - totalScaledVariableDebt * Number(priceInUSD)
      : 0;
  };
  return (
    <ListItemWrapper
      symbol={symbol}
      image={image}
      iconSymbol={iconSymbol}
      name={name}
      detailsAddress={underlyingAsset}
      data-cy={`dashboardBorrowListItem_${symbol.toUpperCase()}`}
      currentMarket={currentMarket}
      showSuperFestTooltip={showSuperFestTooltip(symbol, currentMarket, Side.BORROW)}
    >
      <ListValueColumn
        symbol={symbol}
        value={checkAvailableValue(
          Number(availableBorrows),
          Number(borrowCap),
          Number(totalScaledVariableDebt)
        )}
        subValue={checkAvailableUSDValue(
          Number(availableBorrowsInUSD),
          Number(borrowCap),
          Number(totalScaledVariableDebt)
        )}
        disabled={Number(availableBorrows) === 0}
        withTooltip={false}
        capsComponent={
          <CapsHint
            capType={CapType.borrowCap}
            capAmount={borrowCap}
            totalAmount={totalBorrows}
            withoutText
          />
        }
      />
      <ListAPRColumn
        value={Number(variableBorrowRate)}
        incentives={vIncentivesData}
        symbol={symbol}
      />
      {/* <ListAPRColumn
        value={Number(stableBorrowRate)}
        incentives={sIncentivesData}
        symbol={symbol}
      /> */}
      <ListButtonsColumn>
        <Button
          sx={{
            p: 2,
            height: '36px',
            fontSize: '14px',
            textTransform: 'capitalize',
          }}
          disabled={disableBorrow}
          variant="contained"
          onClick={() => {
            openBorrow(underlyingAsset, currentMarket, name, 'dashboard');
          }}
        >
          <Trans>Borrow</Trans>
        </Button>
        <Button
          sx={{
            p: 2,
            height: '36px',
            fontSize: '14px',
            textTransform: 'capitalize',
            bgcolor: 'transparent',
            color: 'text.primary',
            borderColor: theme.palette.text.subText,
            '&:hover': {
              bgcolor: 'transparent',
            },
          }}
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(underlyingAsset, currentMarket)}
          onClick={() => {
            trackEvent(DASHBOARD.DETAILS_NAVIGATION, {
              type: 'Button',
              market: currentMarket,
              assetName: name,
              asset: underlyingAsset,
            });
          }}
        >
          <Trans>Details</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
