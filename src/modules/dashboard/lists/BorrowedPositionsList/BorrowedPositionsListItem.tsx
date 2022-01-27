import { ListColumn } from '../ListColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { BorrowedPositionsItem } from './types';

export const BorrowedPositionsListItem = ({
  reserve,
  currentBorrows,
  currentBorrowsUSD,
}: BorrowedPositionsItem) => {
  return (
    <ListItemWrapper symbol={reserve.symbol} iconSymbol={reserve.iconSymbol}>
      <ListValueColumn
        symbol={reserve.symbol}
        value={Number(currentBorrows)}
        subValue={Number(currentBorrowsUSD)}
        disabled={Number(currentBorrows) === 0}
      />

      <ListColumn />
      <ListColumn />

      <ListColumn maxWidth={85} />
      <ListColumn maxWidth={85} />
    </ListItemWrapper>
  );
};
