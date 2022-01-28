import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';

import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListColumn } from '../ListColumn';
import { ListItemAPYButton } from '../ListItemAPYButton';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { BorrowedPositionsItem } from './types';

export const BorrowedPositionsListItem = ({
  reserve,
  currentBorrows,
  currentBorrowsUSD,
  borrowRate,
  borrowRateMode,
  vIncentives,
  sIncentives,
  isActive,
  borrowingEnabled,
  isFrozen,
  stableBorrowRateEnabled,
}: BorrowedPositionsItem) => {
  return (
    <ListItemWrapper symbol={reserve.symbol} iconSymbol={reserve.iconSymbol}>
      <ListValueColumn
        symbol={reserve.symbol}
        value={Number(currentBorrows)}
        subValue={Number(currentBorrowsUSD)}
        disabled={Number(currentBorrows) === 0}
      />

      <ListAPRColumn
        value={Number(borrowRate)}
        incentives={borrowRateMode === InterestRate.Variable ? vIncentives : sIncentives}
        symbol={reserve.symbol}
      />

      <ListColumn>
        <ListItemAPYButton
          stableBorrowRateEnabled={stableBorrowRateEnabled}
          borrowRateMode={borrowRateMode}
          disabled={!stableBorrowRateEnabled || isFrozen || !isActive}
          onClick={() => console.log('TODO: should be switch APY mode modal')}
        />
      </ListColumn>

      <ListButtonsColumn>
        <Button
          disabled={!isActive}
          variant="contained"
          onClick={() => console.log('TODO: should be repay modal')}
        >
          <Trans>Repay</Trans>
        </Button>
        <Button
          disabled={!isActive || !borrowingEnabled || isFrozen}
          variant="outlined"
          onClick={() => console.log('TODO: should be borrow modal')}
        >
          <Trans>Borrow</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
