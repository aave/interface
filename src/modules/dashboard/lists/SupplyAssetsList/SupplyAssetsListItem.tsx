import { SwitchHorizontalIcon } from '@heroicons/react/outline';
import { EyeIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, ListItemText, Menu, MenuItem, Stack, SvgIcon } from '@mui/material';
import { useState } from 'react';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { WrappedTokenTooltipContent } from 'src/components/infoTooltips/WrappedTokenToolTipContent';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { NoData } from 'src/components/primitives/NoData';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';
import { DASHBOARD } from 'src/utils/mixPanelEvents';

import { CapsHint } from '../../../../components/caps/CapsHint';
import { CapType } from '../../../../components/caps/helper';
import { ListColumn } from '../../../../components/lists/ListColumn';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemCanBeCollateral } from '../ListItemCanBeCollateral';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';

export const SupplyAssetsListItem = ({
  symbol,
  iconSymbol,
  name,
  walletBalance,
  walletBalanceUSD,
  supplyCap,
  totalLiquidity,
  supplyAPY,
  aIncentivesData,
  underlyingAsset,
  isActive,
  isFreezed,
  isIsolated,
  usageAsCollateralEnabledOnUser,
  detailsAddress,
}: DashboardReserve) => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const currentMarket = useRootStore((store) => store.currentMarket);
  const { wrappedTokenReserves } = useAppDataContext();
  const { walletBalances } = useWalletBalances(currentMarketData);

  const { openSupply, openSwitch } = useModalContext();

  // Disable the asset to prevent it from being supplied if supply cap has been reached
  const { supplyCap: supplyCapUsage, debtCeiling } = useAssetCaps();
  const isMaxCapReached = supplyCapUsage.isMaxed;

  const trackEvent = useRootStore((store) => store.trackEvent);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const wrappedToken = wrappedTokenReserves.find(
    (r) => r.tokenOut.underlyingAsset === underlyingAsset
  );

  const canSupplyAsWrappedToken =
    wrappedToken &&
    walletBalances[wrappedToken.tokenIn.underlyingAsset.toLowerCase()].amount !== '0';

  const disableSupply =
    !isActive ||
    isFreezed ||
    (Number(walletBalance) <= 0 && !canSupplyAsWrappedToken) ||
    isMaxCapReached;

  const onDetailsClick = () => {
    trackEvent(DASHBOARD.DETAILS_NAVIGATION, {
      type: 'Button',
      market: currentMarket,
      assetName: name,
      asset: underlyingAsset,
    });
    setAnchorEl(null);
  };

  const handleSwitchClick = () => {
    openSwitch(underlyingAsset);
    setAnchorEl(null);
  };

  return (
    <ListItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      detailsAddress={detailsAddress}
      data-cy={`dashboardSupplyListItem_${symbol.toUpperCase()}`}
      currentMarket={currentMarket}
      showDebtCeilingTooltips
    >
      {canSupplyAsWrappedToken && walletBalance === '0' ? (
        <ListColumn>
          <ContentWithTooltip
            tooltipContent={
              <WrappedTokenTooltipContent
                decimals={wrappedToken.tokenIn.decimals}
                tokenWrapperAddress={wrappedToken.tokenWrapperAddress}
                tokenInSymbol={wrappedToken.tokenIn.symbol}
                tokenOutSymbol={wrappedToken.tokenOut.symbol}
              />
            }
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FormattedNumber
                value={0}
                variant="secondary14"
                sx={{ mb: '2px' }}
                symbolsColor="common.white"
              />
              <Stack direction="row" alignItems="center">
                <TokenIcon sx={{ fontSize: '14px', mr: 1 }} symbol="DAI" />
                <FormattedNumber
                  value={walletBalances[wrappedToken.tokenIn.underlyingAsset.toLowerCase()].amount}
                  visibleDecimals={2}
                  variant="secondary12"
                  color="text.secondary"
                />
              </Stack>
            </Box>
          </ContentWithTooltip>
        </ListColumn>
      ) : (
        <ListValueColumn
          symbol={symbol}
          value={Number(walletBalance)}
          subValue={walletBalanceUSD}
          withTooltip
          disabled={Number(walletBalance) === 0 || isMaxCapReached}
          capsComponent={
            <CapsHint
              capType={CapType.supplyCap}
              capAmount={supplyCap}
              totalAmount={totalLiquidity}
              withoutText
            />
          }
        />
      )}

      <ListAPRColumn value={Number(supplyAPY)} incentives={aIncentivesData} symbol={symbol} />

      <ListColumn>
        {debtCeiling.isMaxed ? (
          <NoData variant="main14" color="text.secondary" />
        ) : (
          <ListItemCanBeCollateral
            isIsolated={isIsolated}
            usageAsCollateralEnabled={usageAsCollateralEnabledOnUser}
          />
        )}
      </ListColumn>

      <ListButtonsColumn>
        <Button
          disabled={disableSupply}
          variant="contained"
          onClick={() => {
            openSupply(underlyingAsset, currentMarket, name, 'dashboard');
          }}
        >
          <Trans>Supply</Trans>
        </Button>
        <Button
          id="supply-extra-button"
          sx={{
            minWidth: 0,
            px: 4,
          }}
          variant="outlined"
          onClick={handleClick}
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Trans>...</Trans>
        </Button>
        <Menu
          id="supply-item-extra-menu"
          anchorEl={anchorEl}
          open={open}
          MenuListProps={{
            'aria-labelledby': 'supply-extra-button',
            sx: {
              py: 0,
            },
          }}
          onClose={handleClose}
          keepMounted={true}
          PaperProps={{
            sx: {
              minWidth: '120px',
              py: 0,
            },
          }}
        >
          <MenuItem
            sx={{ gap: 2 }}
            onClick={handleSwitchClick}
            disabled={!isFeatureEnabled.switch(currentMarketData)}
          >
            <SvgIcon fontSize="small">
              <SwitchHorizontalIcon />
            </SvgIcon>
            <ListItemText>Switch</ListItemText>
          </MenuItem>
          <MenuItem
            sx={{ gap: 2 }}
            component={Link}
            href={ROUTES.reserveOverview(detailsAddress, currentMarket)}
            onClick={onDetailsClick}
          >
            <SvgIcon fontSize="small">
              <EyeIcon />
            </SvgIcon>
            <ListItemText>Details</ListItemText>
          </MenuItem>
        </Menu>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
