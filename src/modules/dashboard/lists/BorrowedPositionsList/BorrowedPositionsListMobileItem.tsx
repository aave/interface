import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { IncentivesCard } from '../../../../components/incentives/IncentivesCard';
import { APYTypeTooltip } from '../../../../components/infoTooltips/APYTypeTooltip';
import { Row } from '../../../../components/primitives/Row';
import { useModalContext } from '../../../../hooks/useModal';
import { ListItemAPYButton } from '../ListItemAPYButton';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueRow } from '../ListValueRow';

export const BorrowedPositionsListMobileItem = ({
  reserve,
  variableBorrows,
  variableBorrowsUSD,
  stableBorrows,
  stableBorrowsUSD,
  borrowRateMode,
  stableBorrowAPY,
}: DashboardReserve) => {
  const { currentMarket, currentMarketData } = useProtocolDataContext();
  const { openBorrow, openRepay, openRateSwitch, openDebtSwitch } = useModalContext();
  const { borrowCap } = useAssetCaps();
  const trackEvent = useRootStore((store) => store.trackEvent);

  const {
    symbol,
    iconSymbol,
    name,
    isActive,
    isFrozen,
    borrowingEnabled,
    stableBorrowRateEnabled,
    sIncentivesData,
    vIncentivesData,
    variableBorrowAPY,
    underlyingAsset,
  } = reserve;

  const totalBorrows = Number(
    borrowRateMode === InterestRate.Variable ? variableBorrows : stableBorrows
  );

  const totalBorrowsUSD = Number(
    borrowRateMode === InterestRate.Variable ? variableBorrowsUSD : stableBorrowsUSD
  );

  const apy = Number(
    borrowRateMode === InterestRate.Variable ? variableBorrowAPY : stableBorrowAPY
  );

  const incentives = borrowRateMode === InterestRate.Variable ? vIncentivesData : sIncentivesData;

  const disableBorrow = !isActive || !borrowingEnabled || isFrozen || borrowCap.isMaxed;

  const showSwitchButton = isFeatureEnabled.debtSwitch(currentMarketData);
  const disableSwitch = !isActive || reserve.symbol === 'stETH';

  return (
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={reserve.underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      borrowEnabled={reserve.borrowingEnabled}
      showBorrowCapTooltips
    >
      <ListValueRow
        title={<Trans>Debt</Trans>}
        value={totalBorrows}
        subValue={totalBorrowsUSD}
        disabled={totalBorrows === 0}
      />

      <Row caption={<Trans>APY</Trans>} align="flex-start" captionVariant="description" mb={2}>
        <IncentivesCard value={apy} incentives={incentives} symbol={symbol} variant="secondary14" />
      </Row>

      <Row
        caption={
          <APYTypeTooltip text={<Trans>APY type</Trans>} key="APY type" variant="description" />
        }
        captionVariant="description"
        mb={2}
      >
        <ListItemAPYButton
          stableBorrowRateEnabled={stableBorrowRateEnabled}
          borrowRateMode={borrowRateMode}
          disabled={!stableBorrowRateEnabled || isFrozen || !isActive}
          onClick={() => openRateSwitch(underlyingAsset, borrowRateMode)}
          stableBorrowAPY={stableBorrowAPY}
          variableBorrowAPY={variableBorrowAPY}
          underlyingAsset={underlyingAsset}
          currentMarket={currentMarket}
        />
      </Row>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        <Button
          disabled={!isActive}
          variant="contained"
          onClick={() =>
            openRepay(underlyingAsset, borrowRateMode, isFrozen, currentMarket, name, 'dashboard')
          }
          sx={{ mr: 1.5 }}
          fullWidth
        >
          <Trans>Repay</Trans>
        </Button>
        {showSwitchButton ? (
          <Button
            disabled={disableSwitch}
            variant="outlined"
            fullWidth
            onClick={() => {
              trackEvent(GENERAL.OPEN_MODAL, {
                modal: 'Debt Switch',
                market: currentMarket,
                assetName: reserve.name,
                asset: reserve.underlyingAsset,
              });
              openDebtSwitch(reserve.underlyingAsset, borrowRateMode);
            }}
            data-cy={`swapButton`}
          >
            <Trans>Switch</Trans>
          </Button>
        ) : (
          <Button
            disabled={disableBorrow}
            variant="outlined"
            onClick={() => openBorrow(underlyingAsset, currentMarket, name, 'dashboard')}
            fullWidth
          >
            <Trans>Borrow</Trans>
          </Button>
        )}
      </Box>
    </ListMobileItemWrapper>
  );
};
