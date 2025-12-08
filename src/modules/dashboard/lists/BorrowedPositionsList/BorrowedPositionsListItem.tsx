import { API_ETH_MOCK_ADDRESS, ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Trans } from '@lingui/macro';
import { Box, Button, useMediaQuery, useTheme } from '@mui/material';
import { mapAaveProtocolIncentives } from 'src/components/incentives/incentives.helper';
import { IncentivesCard } from 'src/components/incentives/IncentivesCard';
import { Row } from 'src/components/primitives/Row';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCapsSDK } from 'src/hooks/useAssetCapsSDK';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';
import { isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';
import { showExternalIncentivesTooltip } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

import { ListAPRColumn, ListGhoAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { ListValueRow } from '../ListValueRow';

export interface BorrowedPositionsListItem {
  item: DashboardReserve;
  disableEModeSwitch: number | boolean;
}

export const BorrowedPositionsListItem = ({
  item,
  disableEModeSwitch,
}: BorrowedPositionsListItem) => {
  const { borrowCap } = useAssetCapsSDK();
  const [currentMarket, currentMarketData] = useRootStore(
    useShallow((state) => [state.currentMarket, state.currentMarketData])
  );
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const { openBorrow, openRepay, openDebtSwitch } = useModalContext();
  const { reserves: reservesLegacy } = useAppDataContext();

  const reserve = item.reserve;
  // Get legacy reserve data to support Borrow, Repay, Debt Switch modal actions
  const reserveItemLegacy = reservesLegacy.find(
    (r) => r.underlyingAsset.toLowerCase() === reserve.underlyingToken.address.toLowerCase()
  );
  const legacyAsset = reserve.acceptsNative
    ? API_ETH_MOCK_ADDRESS.toLowerCase()
    : reserveItemLegacy?.underlyingAsset.toLowerCase() ||
      reserve.underlyingToken.address.toLowerCase();
  const legacyName = reserveItemLegacy?.name || reserve.underlyingToken.name;

  const disableBorrow =
    reserve.borrowInfo?.borrowingState === 'DISABLED' ||
    reserve.isFrozen ||
    reserve.isPaused ||
    borrowCap.isMaxed;

  const disableRepay = reserve.isPaused;

  const showSwitchButton = !!isFeatureEnabled.debtSwitch(currentMarketData);

  const disableSwitch =
    // NOTE: Disabled on v2 because borrowing is not possible
    currentMarket === 'proto_mainnet' ||
    currentMarket === 'proto_polygon' ||
    reserve.isPaused ||
    reserve.underlyingToken.symbol == 'stETH' ||
    disableEModeSwitch !== 0;

  const borrowProtocolIncentives = mapAaveProtocolIncentives(reserve.incentives, 'borrow');

  const props: BorrowedPositionsListItemProps = {
    ...item,
    disableBorrow,
    disableSwitch,
    disableRepay,
    showSwitchButton,
    totalBorrows: item.balancePosition?.amount.value ?? '0',
    borrowAPY: Number(item.apyPosition?.value ?? 0),
    borrowProtocolIncentives: borrowProtocolIncentives,
    onDetbSwitchClick: () => {
      openDebtSwitch(legacyAsset ?? item.reserve.underlyingToken.address);
    },
    onOpenBorrow: () => {
      openBorrow(legacyAsset, currentMarket, legacyName, 'dashboard');
    },
    onOpenRepay: () => {
      openRepay(
        legacyAsset ?? item.reserve.underlyingToken.address.toLowerCase(),
        item.reserve.isFrozen,
        currentMarket,
        legacyName,
        'dashboard'
      );
    },
  };

  if (downToXSM) {
    return <BorrowedPositionsListItemMobile {...props} />;
  } else {
    return <BorrowedPositionsListItemDesktop {...props} />;
  }
};

interface BorrowedPositionsListItemProps extends Omit<DashboardReserve, 'incentives'> {
  disableBorrow: boolean;
  disableSwitch: boolean;
  disableRepay: boolean;
  showSwitchButton: boolean;
  borrowAPY: number;
  borrowProtocolIncentives: ReserveIncentiveResponse[] | undefined;

  onDetbSwitchClick: () => void;
  onOpenBorrow: () => void;
  onOpenRepay: () => void;
}

const BorrowedPositionsListItemDesktop = ({
  reserve,
  disableBorrow,
  disableSwitch,
  disableRepay,
  showSwitchButton,
  borrowAPY,
  borrowProtocolIncentives,
  symbol,
  iconSymbol,
  name,

  onDetbSwitchClick,
  onOpenBorrow,
  onOpenRepay,
}: BorrowedPositionsListItemProps) => {
  const currentMarket = useRootStore((state) => state.currentMarket);

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
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      paused={reserve.isPaused}
      borrowEnabled={reserve.borrowInfo?.borrowingState === 'ENABLED'}
      data-cy={`dashboardBorrowedListItem_${reserve.underlyingToken.symbol.toUpperCase()}`}
      showBorrowCapTooltips
      showExternalIncentivesTooltips={showExternalIncentivesTooltip(
        reserve.underlyingToken.symbol,
        currentMarket,
        ProtocolAction.borrow
      )}
    >
      <ListValueColumn
        symbol={reserve.underlyingToken.symbol}
        value={reserve.balancePosition?.amount.value ?? '0'}
        subValue={reserve.balancePosition?.usd ?? '0'}
      />

      {isGho ? (
        <ListGhoAPRColumn
          value={borrowAPY}
          market={currentMarket}
          protocolAction={ProtocolAction.borrow}
          address={reserve.vToken.address}
          incentives={borrowProtocolIncentives}
          symbol={reserve.underlyingToken.symbol}
        />
      ) : (
        <ListAPRColumn
          value={borrowAPY}
          market={currentMarket}
          protocolAction={ProtocolAction.borrow}
          address={reserve.vToken.address}
          incentives={borrowProtocolIncentives}
          symbol={reserve.underlyingToken.symbol}
        />
      )}

      <ListButtonsColumn>
        {showSwitchButton ? (
          <Button
            disabled={disableSwitch}
            variant="contained"
            onClick={onDetbSwitchClick}
            data-cy={`swapButton`}
          >
            <Trans>Swap</Trans>
          </Button>
        ) : (
          <Button disabled={disableBorrow} variant="contained" onClick={onOpenBorrow}>
            <Trans>Borrow</Trans>
          </Button>
        )}
        <Button disabled={disableRepay} variant="outlined" onClick={onOpenRepay}>
          <Trans>Repay</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};

const BorrowedPositionsListItemMobile = ({
  reserve,
  disableBorrow,
  disableSwitch,
  disableRepay,
  showSwitchButton,
  borrowAPY,
  borrowProtocolIncentives,
  symbol,
  iconSymbol,
  name,

  onDetbSwitchClick,
  onOpenBorrow,
  onOpenRepay,
}: BorrowedPositionsListItemProps) => {
  const currentMarket = useRootStore((state) => state.currentMarket);
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
      frozen={reserve.isFrozen}
      borrowEnabled={reserve.borrowInfo?.borrowingState === 'ENABLED'}
      showBorrowCapTooltips
      showExternalIncentivesTooltips={showExternalIncentivesTooltip(
        symbol,
        currentMarket,
        ProtocolAction.borrow
      )}
    >
      <ListValueRow
        title={<Trans>Debt</Trans>}
        value={reserve.balancePosition?.amount.value ?? '0'}
        subValue={reserve.balancePosition?.usd ?? '0'}
        disabled={Number(reserve.balancePosition?.amount.value) === 0}
      />

      <Row caption={<Trans>APY</Trans>} align="flex-start" captionVariant="description" mb={2}>
        <IncentivesCard
          value={borrowAPY}
          incentives={borrowProtocolIncentives}
          address={reserve.vToken.address}
          symbol={reserve.underlyingToken.symbol}
          variant="secondary14"
          market={currentMarket}
          protocolAction={ProtocolAction.borrow}
        />
      </Row>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        {showSwitchButton ? (
          <Button
            disabled={disableSwitch}
            variant="contained"
            fullWidth
            onClick={onDetbSwitchClick}
            data-cy={`swapButton`}
          >
            <Trans>Swap</Trans>
          </Button>
        ) : (
          <Button disabled={disableBorrow} variant="contained" onClick={onOpenBorrow} fullWidth>
            <Trans>Borrow</Trans>
          </Button>
        )}
        <Button
          disabled={disableRepay}
          variant="outlined"
          onClick={onOpenRepay}
          sx={{ ml: 1.5 }}
          fullWidth
        >
          <Trans>Repay</Trans>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  );
};
