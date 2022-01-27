import { ListAPRColumn } from '../ListAPRColumn';
import { ListColumn } from '../ListColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { SuppliedPositionsItem } from './types';

export const SuppliedPositionsListItem = ({
  reserve,
  underlyingBalance,
  underlyingBalanceUSD,
  aIncentives,
}: SuppliedPositionsItem) => {
  return (
    <ListItemWrapper symbol={reserve.symbol} iconSymbol={reserve.iconSymbol}>
      <ListValueColumn
        symbol={reserve.symbol}
        value={Number(underlyingBalance)}
        subValue={Number(underlyingBalanceUSD)}
        disabled={Number(underlyingBalance) === 0}
      />

      <ListAPRColumn
        value={Number(reserve.liquidityRate)}
        incentives={aIncentives}
        symbol={reserve.symbol}
      />

      <ListColumn />
      <ListColumn maxWidth={85} />
      <ListColumn maxWidth={85} />
    </ListItemWrapper>
  );
};
