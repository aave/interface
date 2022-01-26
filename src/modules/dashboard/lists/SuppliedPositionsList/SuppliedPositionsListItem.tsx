import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { SuppliedPositionsItem } from './types';

export const SuppliedPositionsListItem = ({
  reserve,
  underlyingBalance,
  underlyingBalanceUSD,
}: SuppliedPositionsItem) => {
  return (
    <ListItemWrapper tokenSymbol={reserve.symbol}>
      <ListValueColumn
        symbol={reserve.symbol}
        value={Number(underlyingBalance)}
        subValue={Number(underlyingBalanceUSD)}
        disabled={Number(underlyingBalance) === 0}
      />
    </ListItemWrapper>
  );
};
