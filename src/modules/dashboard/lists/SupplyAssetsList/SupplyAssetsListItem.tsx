import { SwitchHorizontalIcon } from '@heroicons/react/outline';
import { EyeIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  SvgIcon,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { IncentivesCard } from 'src/components/incentives/IncentivesCard';
import { WrappedTokenTooltipContent } from 'src/components/infoTooltips/WrappedTokenToolTipContent';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { NoData } from 'src/components/primitives/NoData';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { WalletBalancesMap } from 'src/hooks/app-data-provider/useWalletBalances';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWrappedTokens } from 'src/hooks/useWrappedTokens';
import { useRootStore } from 'src/store/root';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';
import { DASHBOARD } from 'src/utils/mixPanelEvents';
import { showSuperFestTooltip, Side } from 'src/utils/utils';

import { CapsHint } from '../../../../components/caps/CapsHint';
import { CapType } from '../../../../components/caps/helper';
import { ListColumn } from '../../../../components/lists/ListColumn';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemCanBeCollateral } from '../ListItemCanBeCollateral';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { ListValueRow } from '../ListValueRow';

export const SupplyAssetsListItem = (
  params: DashboardReserve & { walletBalances: WalletBalancesMap }
) => {
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const { supplyCap } = useAssetCaps();
  const wrappedTokenReserves = useWrappedTokens();

  const { isActive, isFreezed, walletBalance, underlyingAsset } = params;

  const wrappedToken = wrappedTokenReserves.find(
    (r) => r.tokenOut.underlyingAsset === underlyingAsset
  );

  const canSupplyAsWrappedToken =
    wrappedToken &&
    params.walletBalances[wrappedToken.tokenIn.underlyingAsset.toLowerCase()]?.amount !== '0';

  const disableSupply =
    !isActive ||
    isFreezed ||
    (Number(walletBalance) <= 0 && !canSupplyAsWrappedToken) ||
    supplyCap.isMaxed;

  const props: SupplyAssetsListItemProps = {
    ...params,
    disableSupply,
    canSupplyAsWrappedToken: canSupplyAsWrappedToken ?? false,
    walletBalancesMap: params.walletBalances,
    image: params.image,
  };

  if (downToXSM) {
    return <SupplyAssetsListItemMobile {...props} />;
  } else {
    return <SupplyAssetsListItemDesktop {...props} />;
  }
};

interface SupplyAssetsListItemProps extends DashboardReserve {
  disableSupply: boolean;
  canSupplyAsWrappedToken: boolean;
  walletBalancesMap: WalletBalancesMap;
}

export const SupplyAssetsListItemDesktop = ({
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
  isIsolated,
  usageAsCollateralEnabledOnUser,
  detailsAddress,
  disableSupply,
  canSupplyAsWrappedToken,
  walletBalancesMap,
  image,
}: SupplyAssetsListItemProps) => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const currentMarket = useRootStore((store) => store.currentMarket);
  const wrappedTokenReserves = useWrappedTokens();

  const { openSupply, openSwitch } = useModalContext();

  // Disable the asset to prevent it from being supplied if supply cap has been reached
  const { supplyCap: supplyCapUsage, debtCeiling } = useAssetCaps();
  const isMaxCapReached = supplyCapUsage.isMaxed;
  const theme = useTheme();

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
      image={image}
      iconSymbol={iconSymbol}
      name={name}
      detailsAddress={detailsAddress}
      data-cy={`dashboardSupplyListItem_${symbol.toUpperCase()}`}
      currentMarket={currentMarket}
      showDebtCeilingTooltips
      showSuperFestTooltip={showSuperFestTooltip(symbol, currentMarket, Side.SUPPLY)}
    >
      {canSupplyAsWrappedToken && wrappedToken && walletBalance === '0' ? (
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
                  value={
                    walletBalancesMap[wrappedToken.tokenIn.underlyingAsset.toLowerCase()].amount
                  }
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
          sx={{
            p: 2,
            height: '36px',
            fontSize: '14px',
            textTransform: 'capitalize',
          }}
          variant="contained"
          onClick={() => {
            openSupply(underlyingAsset, currentMarket, name, 'dashboard');
          }}
        >
          <Trans>Supply</Trans>
        </Button>
        <Link
          onClick={() => onDetailsClick()}
          href={ROUTES.reserveOverview(detailsAddress, currentMarket)}
        >
          <Button
            sx={{
              p: 2,
              ml: '4px !important',
              height: '36px',
              fontSize: '14px',
              textTransform: 'capitalize',
              borderColor: theme.palette.text.subText,
              bgcolor: 'transparent',
              color: 'text.primary',
              '&:hover': {
                color: '#604AEF',
                borderColor: '#604AEF',
              },
            }}
            // href={ROUTES.reserveOverview(detailsAddress, currentMarket)}
            // onClick={onDetailsClick}
          >
            <Trans>Details</Trans>
          </Button>
        </Link>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};

export const SupplyAssetsListItemMobile = ({
  symbol,
  iconSymbol,
  name,
  walletBalance,
  walletBalanceUSD,
  supplyCap,
  totalLiquidity,
  supplyAPY,
  aIncentivesData,
  isIsolated,
  usageAsCollateralEnabledOnUser,
  underlyingAsset,
  detailsAddress,
  disableSupply,
  canSupplyAsWrappedToken,
  walletBalancesMap,
  image,
}: SupplyAssetsListItemProps) => {
  const { currentMarket } = useProtocolDataContext();
  const { openSupply } = useModalContext();
  const wrappedTokenReserves = useWrappedTokens();

  // Disable the asset to prevent it from being supplied if supply cap has been reached
  const { supplyCap: supplyCapUsage } = useAssetCaps();
  const isMaxCapReached = supplyCapUsage.isMaxed;

  const wrappedToken = wrappedTokenReserves.find(
    (r) => r.tokenOut.underlyingAsset === underlyingAsset
  );

  return (
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      currentMarket={currentMarket}
      showDebtCeilingTooltips
      showSuperFestTooltip={showSuperFestTooltip(symbol, currentMarket, Side.SUPPLY)}
      img={image}
    >
      {canSupplyAsWrappedToken && wrappedToken && walletBalance === '0' ? (
        <Row
          caption={<Trans>Supply balance</Trans>}
          align="flex-start"
          captionVariant="description"
          mb={2}
        >
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
                  value={
                    walletBalancesMap[wrappedToken.tokenIn.underlyingAsset.toLowerCase()].amount
                  }
                  visibleDecimals={2}
                  variant="secondary12"
                  color="text.secondary"
                />
              </Stack>
            </Box>
          </ContentWithTooltip>
        </Row>
      ) : (
        <ListValueRow
          title={<Trans>Supply balance</Trans>}
          value={Number(walletBalance)}
          subValue={walletBalanceUSD}
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

      <Row
        caption={<Trans>Supply APY</Trans>}
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <IncentivesCard
          value={Number(supplyAPY)}
          incentives={aIncentivesData}
          symbol={symbol}
          variant="secondary14"
        />
      </Row>

      <Row
        caption={<Trans>Can be collateral</Trans>}
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <ListItemCanBeCollateral
          isIsolated={isIsolated}
          usageAsCollateralEnabled={usageAsCollateralEnabledOnUser}
        />
      </Row>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        <Button
          disabled={disableSupply}
          variant="contained"
          onClick={() => openSupply(underlyingAsset, currentMarket, name, 'dashboard')}
          sx={{ mr: 1.5 }}
          fullWidth
        >
          <Trans>Supply</Trans>
        </Button>

        <Link href={ROUTES.reserveOverview(detailsAddress, currentMarket)}>
          <Button
            variant="outlined"
            component={Link}
            // href={ROUTES.reserveOverview(detailsAddress, currentMarket)}
            fullWidth
          >
            <Trans>Details</Trans>
          </Button>
        </Link>
      </Box>
    </ListMobileItemWrapper>
  );
};
