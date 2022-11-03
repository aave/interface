import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { GHODiscountButton } from 'src/components/gho/GHODiscountButton';
import { GHOBorrowRateTooltip } from 'src/components/infoTooltips/GHOBorrowRateTooltip';
import { StableAPYTooltip } from 'src/components/infoTooltips/StableAPYTooltip';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import { IncentivesCard } from '../../../../components/incentives/IncentivesCard';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import { Row } from '../../../../components/primitives/Row';
import { useModalContext } from '../../../../hooks/useModal';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueRow } from '../ListValueRow';
import { GHOBorrowAssetsItem } from './types';

export const GHOBorrowAssetsListMobileItem = ({
  symbol,
  iconSymbol,
  name,
  baseVariableBorrowRate,
  vIncentivesData,
  underlyingAsset,
  isFreezed,
  userAvailableBorrows,
}: GHOBorrowAssetsItem) => {
  const { openBorrow } = useModalContext();
  const { currentMarket } = useProtocolDataContext();
  const borrowButtonDisable = isFreezed || Number(userAvailableBorrows) <= 0; // TO-DO: Factor in facilitator cap
  const availableBorrows = Number(userAvailableBorrows);

  return (
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      currentMarket={currentMarket}
    >
      <ListValueRow
        title={<Trans>Available to borrow</Trans>}
        value={availableBorrows} // TO-DO: Factor in facilitator cap
        subValue={availableBorrows}
        disabled={availableBorrows === 0}
      />

      <Row
        caption={
          <VariableAPYTooltip
            text={<Trans>APY, variable</Trans>}
            key="APY_dash_mob_variable_ type"
            variant="description"
          />
        }
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <IncentivesCard
          value={Number(baseVariableBorrowRate) / 10 ** 27}
          incentives={vIncentivesData}
          symbol={symbol}
          variant="secondary14"
          tooltip={<GHOBorrowRateTooltip />}
        />
      </Row>

      <Row
        caption={
          <StableAPYTooltip
            text={<Trans>APY, stable</Trans>}
            key="APY_dash_mob_stable_ type"
            variant="description"
          />
        }
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <IncentivesCard value={0} incentives={[]} symbol={symbol} variant="secondary14" />
      </Row>

      <GHODiscountButton />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        <Button
          disabled={borrowButtonDisable}
          variant="contained"
          onClick={() => openBorrow(underlyingAsset)}
          sx={{ mr: 1.5 }}
          fullWidth
        >
          <Trans>Borrow</Trans>
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(underlyingAsset, currentMarket)}
          fullWidth
        >
          <Trans>Details</Trans>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  );
};
