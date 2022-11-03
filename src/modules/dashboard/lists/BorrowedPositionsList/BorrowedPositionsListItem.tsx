import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { GHODiscountButton } from 'src/components/gho/GHODiscountButton';
import { GHOBorrowRateTooltip } from 'src/components/infoTooltips/GHOBorrowRateTooltip';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { ghoMintingAvailable } from 'src/utils/ghoUtilities';

import { ListColumn } from '../../../../components/lists/ListColumn';
import { ComputedUserReserveData } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemAPYButton } from '../ListItemAPYButton';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';

export const BorrowedPositionsListItem = ({
  reserve,
  variableBorrows,
  variableBorrowsUSD,
  stableBorrows,
  stableBorrowsUSD,
  borrowRateMode,
  stableBorrowAPY,
}: ComputedUserReserveData & { borrowRateMode: InterestRate }) => {
  const { openBorrow, openRepay, openRateSwitch } = useModalContext();
  const { currentMarket } = useProtocolDataContext();
  const {
    symbol,
    isActive,
    isFrozen,
    borrowingEnabled,
    stableBorrowRateEnabled,
    sIncentivesData,
    vIncentivesData,
    variableBorrowAPY,
    baseVariableBorrowRate,
  } = reserve;
  const ghoMinting = ghoMintingAvailable({ symbol, currentMarket });
  const variableBorrowAPYDisplay = ghoMinting
    ? Number(baseVariableBorrowRate) / 10 ** 27
    : variableBorrowAPY;
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
      footerButton={<GHODiscountButton />}
    >
      <ListValueColumn
        symbol={reserve.symbol}
        value={Number(borrowRateMode === InterestRate.Variable ? variableBorrows : stableBorrows)}
        subValue={Number(
          borrowRateMode === InterestRate.Variable ? variableBorrowsUSD : stableBorrowsUSD
        )}
      />

      <ListAPRColumn
        value={Number(
          borrowRateMode === InterestRate.Variable ? variableBorrowAPYDisplay : stableBorrowAPY
        )}
        incentives={borrowRateMode === InterestRate.Variable ? vIncentivesData : sIncentivesData}
        symbol={reserve.symbol}
        tooltip={ghoMinting && <GHOBorrowRateTooltip />}
      />

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
          onClick={() => openRepay(reserve.underlyingAsset, borrowRateMode)}
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
