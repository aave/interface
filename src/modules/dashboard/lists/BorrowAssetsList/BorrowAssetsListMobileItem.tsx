import { ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { mapAaveProtocolIncentives } from 'src/components/incentives/incentives.helper';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { showExternalIncentivesTooltip } from 'src/utils/utils';

import { CapsHint } from '../../../../components/caps/CapsHint';
import { CapType } from '../../../../components/caps/helper';
import { IncentivesCard } from '../../../../components/incentives/IncentivesCard';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import { Row } from '../../../../components/primitives/Row';
import { useModalContext } from '../../../../hooks/useModal';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueRow } from '../ListValueRow';

export const BorrowAssetsListMobileItem = ({
  reserve,
  symbol,
  iconSymbol,
  name,
  availableBorrows,
  availableBorrowsInUSD,
  totalBorrows,
}: DashboardReserve) => {
  const { openBorrow } = useModalContext();
  const currentMarket = useRootStore((state) => state.currentMarket);
  const { isPaused, isFrozen } = reserve;
  // Get legacy reserve data to support Borrow modal actions
  const { reserves: reservesLegacy } = useAppDataContext();
  const reserveItemLegacy = reservesLegacy.find(
    (r) => r.underlyingAsset.toLowerCase() === reserve.underlyingToken.address.toLowerCase()
  );
  const legacyAsset = reserveItemLegacy?.underlyingAsset?.toLowerCase();
  const legacyName = reserveItemLegacy?.name || reserve.underlyingToken.name;
  const disableBorrow = isPaused || isFrozen || Number(availableBorrows) <= 0;
  const borrowProtocolIncentives = mapAaveProtocolIncentives(reserve.incentives, 'borrow');
  const { iconSymbol: iconSymbolFetched } = fetchIconSymbolAndName({
    underlyingAsset: reserve.underlyingToken.address,
    symbol: reserve.underlyingToken.symbol,
    name: reserve.underlyingToken.name,
  });

  const displayIconSymbol =
    iconSymbolFetched?.toLowerCase() !== reserve.underlyingToken.symbol.toLowerCase()
      ? iconSymbolFetched
      : reserve.underlyingToken.symbol;
  return (
    <ListMobileItemWrapper
      symbol={symbol || reserve.underlyingToken.symbol}
      iconSymbol={iconSymbol || displayIconSymbol}
      name={name || reserve.underlyingToken.name}
      underlyingAsset={reserve.underlyingToken.address.toLowerCase()}
      currentMarket={currentMarket}
      showExternalIncentivesTooltips={showExternalIncentivesTooltip(
        symbol,
        currentMarket,
        ProtocolAction.borrow
      )}
    >
      <ListValueRow
        title={<Trans>Available to borrow</Trans>}
        value={Number(availableBorrows)}
        subValue={Number(availableBorrowsInUSD)}
        disabled={Number(availableBorrows) === 0}
        capsComponent={
          <CapsHint
            capType={CapType.borrowCap}
            capAmount={reserve.borrowInfo?.borrowCap.amount.value.toString() || '0'}
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
        <IncentivesCard
          value={Number(reserve.borrowInfo?.apy.value || '0')}
          incentives={borrowProtocolIncentives}
          address={reserve.vToken.address}
          symbol={reserve.underlyingToken.symbol}
          variant="secondary14"
          market={currentMarket}
          protocolAction={ProtocolAction.borrow}
        />
      </Row>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        <Button
          disabled={disableBorrow}
          variant="contained"
          onClick={() =>
            openBorrow(
              legacyAsset || reserve.underlyingToken.address.toLowerCase(),
              currentMarket,
              legacyName,
              'dashboard'
            )
          }
          sx={{ mr: 1.5 }}
          fullWidth
        >
          <Trans>Borrow</Trans>
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(
            reserve.underlyingToken.address.toLowerCase(),
            currentMarket
          )}
          fullWidth
        >
          <Trans>Details</Trans>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  );
};
