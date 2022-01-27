import { InterestRate } from '@aave/contract-helpers';

import { ListAPRColumn } from '../ListAPRColumn';
import { ListColumn } from '../ListColumn';
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

      <ListColumn />
      <ListColumn maxWidth={85} />
      <ListColumn maxWidth={85} />
    </ListItemWrapper>
  );
};
