import { CapsHint } from '../../../../components/caps/CapsHint';
import { CapType } from '../../../../components/caps/helper';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListColumn } from '../ListColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { SupplyAssetsItem } from './types';

export const SupplyAssetsListItem = ({
  symbol,
  iconSymbol,
  walletBalance,
  walletBalanceUSD,
  supplyCap,
  totalLiquidity,
  liquidityRate,
  aIncentives,
}: SupplyAssetsItem) => {
  return (
    <ListItemWrapper symbol={symbol} iconSymbol={iconSymbol}>
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

      <ListAPRColumn value={Number(liquidityRate)} incentives={aIncentives} symbol={symbol} />

      <ListColumn />
      <ListColumn maxWidth={85} />
      <ListColumn maxWidth={85} />
    </ListItemWrapper>
  );
};
