import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { BorrowedPositionsItem } from './types';

export const BorrowedPositionsListItem = ({
  reserve,
  currentBorrows,
  currentBorrowsUSD,
}: BorrowedPositionsItem) => {
  return (
    <ListItemWrapper tokenSymbol={reserve.symbol}>
      <ListValueColumn
        symbol={reserve.symbol}
        value={Number(currentBorrows)}
        subValue={Number(currentBorrowsUSD)}
        disabled={Number(currentBorrows) === 0}
      />
    </ListItemWrapper>
  );
};
