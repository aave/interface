import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import PercentIcon from 'public/icons/markets/percent-icon.svg';
import { GhoIncentivesCard } from 'src/components/incentives/GhoIncentivesCard';
import { ROUTES } from 'src/components/primitives/Link';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { weightedAverageAPY } from 'src/utils/ghoUtilities';

import { ListColumn } from '../../../../components/lists/ListColumn';
import { ComputedUserReserveData } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemAPYButton } from '../ListItemAPYButton';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';

export const GhoBorrowedPositionsListItem = ({
  reserve,
  variableBorrows,
  variableBorrowsUSD,
  borrowRateMode,
  stableBorrowAPY,
}: ComputedUserReserveData & { borrowRateMode: InterestRate }) => {
  const { openBorrow, openRepay, openRateSwitch } = useModalContext();
  const { currentMarket } = useProtocolDataContext();
  const { isActive, isFrozen, borrowingEnabled, stableBorrowRateEnabled, variableBorrowAPY } =
    reserve;
  const {
    ghoLoadingData,
    ghoLoadingMarketData,
    ghoComputed: { borrowAPYWithMaxDiscount, discountableAmount },
    stkAaveBalance,
    ghoDiscountRatePercent,
    ghoBorrowAPY,
  } = useRootStore();

  const borrowRateAfterDiscount = weightedAverageAPY(
    ghoBorrowAPY,
    Number(variableBorrows),
    discountableAmount,
    borrowAPYWithMaxDiscount
  );

  const loading = ghoLoadingData || ghoLoadingMarketData;

  return (
    <ListItemWrapper
      symbol={reserve.symbol}
      iconSymbol={reserve.iconSymbol}
      name={reserve.name}
      detailsAddress={reserve.underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      data-cy={`dashboardBorrowedListItem_${reserve.symbol.toUpperCase()}_${borrowRateMode}`}
      showBorrowCapTooltips
      ghoBorder
    >
      <ListValueColumn
        symbol={reserve.symbol}
        value={variableBorrows}
        subValue={Number(variableBorrowsUSD)}
      />

      <ListColumn>
        <Box sx={{ display: 'flex' }}>
          <GhoIncentivesCard
            value={loading ? -1 : borrowRateAfterDiscount}
            incentives={reserve.vIncentivesData}
            symbol={reserve.symbol}
            data-cy={`apyType`}
            tooltip={<PercentIcon />}
            borrowAmount={variableBorrows}
            baseApy={ghoBorrowAPY}
            discountPercent={ghoDiscountRatePercent * -1}
            discountableAmount={discountableAmount}
            stkAaveBalance={stkAaveBalance || 0}
            ghoRoute={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket) + '/#discount'}
          />
        </Box>
      </ListColumn>

      <ListColumn>
        <ListItemAPYButton
          stableBorrowRateEnabled={stableBorrowRateEnabled}
          borrowRateMode={borrowRateMode}
          disabled={!stableBorrowRateEnabled || isFrozen || !isActive}
          onClick={() => openRateSwitch(reserve.underlyingAsset, borrowRateMode)}
          stableBorrowAPY={stableBorrowAPY}
          variableBorrowAPY={variableBorrowAPY}
          underlyingAsset={reserve.underlyingAsset}
          currentMarket={currentMarket}
        />
      </ListColumn>

      <ListButtonsColumn>
        <Button
          disabled={!isActive}
          variant="contained"
          onClick={() => openRepay(reserve.underlyingAsset, borrowRateMode, false)}
        >
          <Trans>Repay</Trans>
        </Button>
        <Button
          disabled={!isActive || !borrowingEnabled || isFrozen}
          variant="outlined"
          onClick={() => openBorrow(reserve.underlyingAsset)}
        >
          <Trans>Borrow</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
