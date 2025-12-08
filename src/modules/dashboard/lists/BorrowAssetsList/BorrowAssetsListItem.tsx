import { API_ETH_MOCK_ADDRESS, ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { mapAaveProtocolIncentives } from 'src/components/incentives/incentives.helper';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { DASHBOARD } from 'src/utils/events';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';
import { showExternalIncentivesTooltip } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

import { CapsHint } from '../../../../components/caps/CapsHint';
import { CapType } from '../../../../components/caps/helper';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import { ListAPRColumn, ListGhoAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';

export const BorrowAssetsListItem = ({
  reserve,
  symbol,
  iconSymbol,
  name,
  availableBorrows,
  availableBorrowsInUSD,
  totalBorrows,
}: DashboardReserve) => {
  const { openBorrow } = useModalContext();
  const { isPaused, isFrozen } = reserve;
  // Get legacy reserve data to support Borrow modal actions
  const { reserves: reservesLegacy } = useAppDataContext();
  const reserveItemLegacy = reservesLegacy.find(
    (r) => r.underlyingAsset.toLowerCase() === reserve.underlyingToken.address.toLowerCase()
  );
  const legacyAsset = reserve.acceptsNative
    ? API_ETH_MOCK_ADDRESS.toLowerCase()
    : reserveItemLegacy?.underlyingAsset.toLowerCase() ||
      reserve.underlyingToken.address.toLowerCase();
  const legacyName = reserveItemLegacy?.name || reserve.underlyingToken.name;
  const disableBorrow = isPaused || isFrozen || Number(availableBorrows) <= 0;

  const [trackEvent, currentMarket] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentMarket])
  );
  const borrowProtocolIncentives = mapAaveProtocolIncentives(reserve.incentives, 'borrow');
  const isGho = displayGhoForMintableMarket({
    symbol: reserve.underlyingToken.symbol,
    currentMarket,
  });

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
    <ListItemWrapper
      symbol={symbol || reserve.underlyingToken.symbol}
      iconSymbol={iconSymbol || displayIconSymbol}
      name={name || reserve.underlyingToken.name}
      detailsAddress={reserve.underlyingToken.address.toLowerCase()}
      data-cy={`dashboardBorrowListItem_${reserve.underlyingToken.symbol.toUpperCase()}`}
      currentMarket={currentMarket}
      showExternalIncentivesTooltips={showExternalIncentivesTooltip(
        symbol,
        currentMarket,
        ProtocolAction.borrow
      )}
    >
      <ListValueColumn
        symbol={reserve.underlyingToken.symbol}
        value={Number(availableBorrows)}
        subValue={Number(availableBorrowsInUSD)}
        disabled={Number(availableBorrows) === 0}
        withTooltip={false}
        capsComponent={
          <CapsHint
            capType={CapType.borrowCap}
            capAmount={reserve.borrowInfo?.borrowCap.amount.value.toString() || '0'}
            totalAmount={totalBorrows}
            withoutText
          />
        }
      />
      {isGho ? (
        <ListGhoAPRColumn
          value={Number(reserve.borrowInfo?.apy.value || '0')}
          market={currentMarket}
          protocolAction={ProtocolAction.borrow}
          address={reserve.vToken.address}
          incentives={borrowProtocolIncentives}
          symbol={reserve.underlyingToken.symbol}
        />
      ) : (
        <ListAPRColumn
          value={Number(reserve.borrowInfo?.apy.value || '0')}
          market={currentMarket}
          protocolAction={ProtocolAction.borrow}
          address={reserve.vToken.address}
          incentives={borrowProtocolIncentives}
          symbol={reserve.underlyingToken.symbol}
        />
      )}

      <ListButtonsColumn>
        <Button
          disabled={disableBorrow}
          variant="contained"
          onClick={() => {
            openBorrow(legacyAsset, currentMarket, legacyName, 'dashboard');
          }}
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
          onClick={() => {
            trackEvent(DASHBOARD.DETAILS_NAVIGATION, {
              type: 'Button',
              market: currentMarket,
              assetName: reserve.underlyingToken.name,
              asset: reserve.underlyingToken.address,
            });
          }}
        >
          <Trans>Details</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
