import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';

import { CapsHint } from '../../../../components/caps/CapsHint';
import { CapType } from '../../../../components/caps/helper';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
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
  underlyingAsset,
  isActive,
  isFreezed,
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

      <ListButtonsColumn>
        <Button
          disabled={!isActive || isFreezed || Number(walletBalance) <= 0}
          variant="contained"
          onClick={() => console.log('TODO: should be supply modal')}
        >
          <Trans>Supply</Trans>
        </Button>
        <Button variant="outlined" component={Link} href={ROUTES.reserveOverview(underlyingAsset)}>
          <Trans>Details</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
