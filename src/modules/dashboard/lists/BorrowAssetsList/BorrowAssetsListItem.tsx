import { CapsHint } from '../../../../components/caps/CapsHint';
import { CapType } from '../../../../components/caps/helper';
import { ListColumn } from '../ListColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { BorrowAssetsItem } from './types';

export const BorrowAssetsListItem = ({
  symbol,
  iconSymbol,
  availableBorrows,
  availableBorrowsInUSD,
  borrowCap,
  totalBorrows,
}: BorrowAssetsItem) => {
  return (
    <ListItemWrapper symbol={symbol} iconSymbol={iconSymbol}>
      <ListValueColumn
        symbol={symbol}
        value={Number(availableBorrows)}
        subValue={Number(availableBorrowsInUSD)}
        disabled={Number(availableBorrows) === 0}
        withTooltip
        capsComponent={
          <CapsHint
            capType={CapType.borrowCap}
            capAmount={borrowCap}
            totalAmount={totalBorrows}
            withoutText
          />
        }
      />

      <ListColumn />
      <ListColumn />

      <ListColumn maxWidth={85} />
      <ListColumn maxWidth={85} />
    </ListItemWrapper>
  );
};
