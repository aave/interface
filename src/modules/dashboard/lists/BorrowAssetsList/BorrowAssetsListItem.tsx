import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';

import { CapsHint } from '../../../../components/caps/CapsHint';
import { CapType } from '../../../../components/caps/helper';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
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
  variableBorrowRate,
  stableBorrowRate,
  vIncentives,
  sIncentives,
  underlyingAsset,
  isFreezed,
  borrowingEnabled,
  borrowableInIsolation,
}: BorrowAssetsItem) => {
  const borrowButtonDisable = isFreezed || Number(availableBorrows) <= 0;

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

      <ListAPRColumn value={Number(variableBorrowRate)} incentives={vIncentives} symbol={symbol} />
      <ListAPRColumn value={Number(stableBorrowRate)} incentives={sIncentives} symbol={symbol} />

      <ListButtonsColumn>
        <Button
          disabled={borrowButtonDisable}
          variant="contained"
          onClick={() => console.log('TODO: should be borrow modal')}
        >
          <Trans>Borrow</Trans>
        </Button>
        <Button variant="outlined" component={Link} href={ROUTES.reserveOverview(underlyingAsset)}>
          <Trans>Details</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
