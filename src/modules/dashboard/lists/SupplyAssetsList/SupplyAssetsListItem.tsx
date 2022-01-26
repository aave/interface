import { CapsHint } from '../../../../components/caps/CapsHint';
import { CapType } from '../../../../components/caps/helper';
import { ListColumn } from '../ListColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { SupplyAssetsItem } from './types';

export const SupplyAssetsListItem = ({
  symbol,
  walletBalance,
  walletBalanceUSD,
  supplyCap,
  totalLiquidity,
}: SupplyAssetsItem) => {
  return (
    <ListItemWrapper tokenSymbol={symbol}>
      <ListValueColumn
        symbol={symbol}
        value={Number(walletBalance)}
        subValue={walletBalanceUSD}
        withTooltip
        disabled={Number(walletBalance) === 0}
        capsComponent={
          <CapsHint
            capType={CapType.supplyCap}
            capAmount={supplyCap}
            totalAmount={totalLiquidity}
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
