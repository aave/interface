import { ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { useRootStore } from 'src/store/root';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';

import { CapsHint } from '../../../../components/caps/CapsHint';
import { CapType } from '../../../../components/caps/helper';
import { RateAndIncentivesBox } from '../../../../components/incentives/RateAndIncentivesBox';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import { Row } from '../../../../components/primitives/Row';
import { useModalContext } from '../../../../hooks/useModal';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueRow } from '../ListValueRow';

export const BorrowAssetsListMobileItem = ({
  symbol,
  iconSymbol,
  name,
  availableBorrows,
  availableBorrowsInUSD,
  borrowCap,
  totalBorrows,
  variableBorrowRate,
  vIncentivesData,
  variableDebtTokenAddress,
  underlyingAsset,
  isFreezed,
}: DashboardReserve) => {
  const { openBorrow } = useModalContext();
  const currentMarket = useRootStore((state) => state.currentMarket);

  const disableBorrow = isFreezed || Number(availableBorrows) <= 0;

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
        value={Number(availableBorrows)}
        subValue={Number(availableBorrowsInUSD)}
        disabled={Number(availableBorrows) === 0}
        capsComponent={
          <CapsHint
            capType={CapType.borrowCap}
            capAmount={borrowCap}
            totalAmount={totalBorrows}
            withoutText
          />
        }
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
        <RateAndIncentivesBox
          value={Number(variableBorrowRate)}
          incentives={vIncentivesData}
          address={variableDebtTokenAddress}
          symbol={symbol}
          variant="secondary14"
          market={currentMarket}
          protocolAction={ProtocolAction.borrow}
        />
      </Row>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        <Button
          disabled={disableBorrow}
          variant="contained"
          onClick={() => openBorrow(underlyingAsset, currentMarket, name, 'dashboard')}
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
