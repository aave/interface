import { InterestRate } from '@aave/contract-helpers';
import { ExclamationCircleIcon } from '@heroicons/react/outline';
import { ArrowNarrowRightIcon, CheckIcon } from '@heroicons/react/solid';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { Box, Button, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import { IncentivesCard } from 'src/components/incentives/IncentivesCard';
import { MigrationDisabledTooltip } from 'src/components/infoTooltips/MigrationDisabledTooltip';
import { IsolatedBadge } from 'src/components/isolationMode/IsolatedBadge';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ROUTES } from 'src/components/primitives/Link';
import { NoData } from 'src/components/primitives/NoData';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ComputedUserReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { MigrationDisabled, V3Rates } from 'src/store/v3MigrationSelectors';

import { MigrationListItemToggler } from './MigrationListItemToggler';
import { MigrationListMobileItem } from './MigrationListMobileItem';
import { StETHMigrationWarning } from './StETHMigrationWarning';

interface MigrationListItemProps {
  checked: boolean;
  amount: string;
  amountInUSD: string;
  onCheckboxClick: () => void;
  disabled?: MigrationDisabled;
  enabledAsCollateral?: boolean;
  canBeEnforced?: boolean;
  enableAsCollateral?: () => void;
  isIsolated?: boolean;
  borrowApyType?: string;
  userReserve: ComputedUserReserveData;
  v3Rates?: V3Rates;
  enteringIsolation: boolean;
  userControlledCollateral?: boolean;
}

export const MigrationListItem = ({
  checked,
  amount,
  amountInUSD,
  onCheckboxClick,
  enabledAsCollateral,
  disabled,
  enableAsCollateral,
  isIsolated,
  enteringIsolation,
  borrowApyType,
  userReserve,
  v3Rates,
  userControlledCollateral,
  canBeEnforced,
}: MigrationListItemProps) => {
  const theme = useTheme();
  const { currentMarket, currentMarketData } = useRootStore();
  const isDesktop = useMediaQuery(theme.breakpoints.up('xl'));
  const isTablet = useMediaQuery(theme.breakpoints.up(655));
  const isMobile = useMediaQuery(theme.breakpoints.down(655));

  const assetColumnWidth =
    isMobile && !isTablet ? 45 : isTablet && !isDesktop ? 80 : isDesktop ? 120 : 80;
  const baseColor = disabled === undefined ? 'text.primary' : 'text.muted';
  const baseColorSecondary = disabled === undefined ? 'text.secondary' : 'text.muted';

  const v2APY = borrowApyType
    ? borrowApyType === InterestRate.Stable
      ? userReserve.stableBorrowAPY
      : userReserve.reserve.variableBorrowAPY
    : userReserve.reserve.supplyAPY;
  const v2Incentives = borrowApyType
    ? borrowApyType === InterestRate.Stable
      ? userReserve.reserve.sIncentivesData
      : userReserve.reserve.vIncentivesData
    : userReserve.reserve.aIncentivesData;
  const v3APY = borrowApyType ? v3Rates?.variableBorrowAPY || '-1' : v3Rates?.supplyAPY || '-1';
  const v3Incentives = borrowApyType
    ? v3Rates?.vIncentivesData || []
    : v3Rates?.aIncentivesData || [];

  const showCollateralToggle = userControlledCollateral && isIsolated && canBeEnforced;

  if (isMobile)
    return (
      <MigrationListMobileItem
        checked={checked}
        amount={amount}
        amountInUSD={amountInUSD}
        onCheckboxClick={onCheckboxClick}
        enabledAsCollateral={enabledAsCollateral}
        disabled={disabled}
        enableAsCollateral={enableAsCollateral}
        isIsolated={isIsolated}
        enteringIsolation={enteringIsolation}
        borrowApyType={borrowApyType}
        userReserve={userReserve}
        v3Rates={v3Rates}
        showCollateralToggle={showCollateralToggle}
      />
    );
  return (
    <ListItem sx={{ flexDirection: 'column', pl: 0 }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', py: 4 }}>
          <ListColumn align="center" maxWidth={64} minWidth={64}>
            <Box
              sx={(theme) => ({
                border: `2px solid ${
                  disabled !== undefined
                    ? theme.palette.action.disabled
                    : theme.palette.text.secondary
                }`,
                background:
                  disabled !== undefined
                    ? theme.palette.background.disabled
                    : checked
                    ? theme.palette.text.secondary
                    : theme.palette.background.paper,
                width: 16,
                height: 16,
                borderRadius: '2px',
                '&:hover': {
                  cursor: disabled !== undefined ? 'not-allowed' : 'pointer',
                },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              })}
              onClick={disabled !== undefined ? undefined : onCheckboxClick}
            >
              {disabled === undefined && (
                <SvgIcon sx={{ fontSize: '14px', color: 'background.paper' }}>
                  <CheckIcon />
                </SvgIcon>
              )}
            </Box>
          </ListColumn>

          <ListColumn align="left" maxWidth={assetColumnWidth} minWidth={assetColumnWidth}>
            <Row>
              <TokenIcon symbol={userReserve.reserve.iconSymbol} fontSize="large" />

              <Box sx={{ pl: '12px', overflow: 'hidden', display: 'flex' }}>
                <Typography variant="subheader1" color={baseColor} noWrap sx={{ pr: 1 }}>
                  {userReserve.reserve.symbol}
                </Typography>
                {disabled !== undefined && (
                  <MigrationDisabledTooltip
                    dashboardLink={ROUTES.dashboard + '/?marketName=' + currentMarket + '_v3'}
                    marketName={currentMarketData.marketTitle}
                    warningType={disabled}
                    isolatedV3={!enteringIsolation}
                  />
                )}
              </Box>
            </Row>
          </ListColumn>
        </Box>

        {!!enableAsCollateral && (
          <ListColumn align="right">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {userReserve.usageAsCollateralEnabledOnUser &&
              userReserve.reserve.reserveLiquidationThreshold !== '0' ? (
                <CheckRoundedIcon fontSize="small" color="success" />
              ) : (
                <NoData variant="main14" color={baseColorSecondary} />
              )}

              <SvgIcon sx={{ px: 1.5 }}>
                <ArrowNarrowRightIcon
                  fontSize="14px"
                  color={
                    disabled === undefined ? theme.palette.text.primary : theme.palette.text.muted
                  }
                />
              </SvgIcon>

              {showCollateralToggle ? (
                <MigrationListItemToggler
                  enableAsCollateral={enableAsCollateral}
                  enabledAsCollateral={enabledAsCollateral}
                />
              ) : !enabledAsCollateral ? (
                <NoData variant="main14" color={baseColorSecondary} />
              ) : isIsolated ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <SvgIcon sx={{ color: 'warning.main', fontSize: '20px' }}>
                    <ExclamationCircleIcon />
                  </SvgIcon>
                  <IsolatedBadge />
                </Box>
              ) : (
                <CheckRoundedIcon fontSize="small" color="success" />
              )}
            </Box>
          </ListColumn>
        )}
        {!!v3Rates?.ltv && (
          <ListColumn align="right">
            <Box sx={{ display: 'flex' }}>
              <FormattedNumber
                value={userReserve.reserve.formattedBaseLTVasCollateral}
                percent
                variant="secondary14"
                color={baseColor}
              />
              <SvgIcon sx={{ px: 1.5 }}>
                <ArrowNarrowRightIcon
                  fontSize="14px"
                  color={
                    disabled === undefined ? theme.palette.text.primary : theme.palette.text.muted
                  }
                />
              </SvgIcon>
              <FormattedNumber
                value={v3Rates.ltv}
                percent
                variant="secondary14"
                color={baseColor}
              />
            </Box>
          </ListColumn>
        )}
        <ListColumn align="right">
          <Box sx={{ display: 'flex' }}>
            <IncentivesCard
              value={v2APY}
              symbol={userReserve.reserve.symbol}
              incentives={v2Incentives}
              variant="main14"
              color={baseColor}
            />
            <SvgIcon sx={{ px: 1.5 }}>
              <ArrowNarrowRightIcon
                fontSize="14px"
                color={
                  disabled === undefined ? theme.palette.text.primary : theme.palette.text.muted
                }
              />
            </SvgIcon>
            <IncentivesCard
              value={v3APY}
              symbol={userReserve.reserve.symbol}
              incentives={v3Incentives}
              variant="main14"
              color={baseColor}
            />
          </Box>
        </ListColumn>

        {!!borrowApyType && (
          <ListColumn align="right">
            <Box sx={{ display: 'flex' }}>
              <Button
                variant="outlined"
                size="small"
                sx={{ width: '50px', background: 'white' }}
                disabled
              >
                <Typography variant="buttonS" color={baseColor}>
                  {borrowApyType}
                </Typography>
              </Button>
              <SvgIcon sx={{ px: 1.5 }}>
                <ArrowNarrowRightIcon
                  fontSize="14px"
                  color={
                    disabled === undefined ? theme.palette.text.primary : theme.palette.text.muted
                  }
                />
              </SvgIcon>
              <Button
                variant="outlined"
                size="small"
                sx={{ width: '50px', background: 'white' }}
                disabled
              >
                <Typography variant="buttonS" color={baseColor}>
                  Variable
                </Typography>
              </Button>
            </Box>
          </ListColumn>
        )}

        {!!v3Rates?.liquidationThreshold && (
          <ListColumn align="right">
            <Box sx={{ display: 'flex' }}>
              <FormattedNumber
                value={userReserve.reserve.formattedReserveLiquidationThreshold}
                percent
                variant="secondary14"
                color={baseColor}
              />
              <SvgIcon sx={{ px: 1.5 }}>
                <ArrowNarrowRightIcon
                  fontSize="14px"
                  color={
                    disabled === undefined ? theme.palette.text.primary : theme.palette.text.muted
                  }
                />
              </SvgIcon>
              <FormattedNumber
                value={v3Rates.liquidationThreshold}
                percent
                variant="secondary14"
                color={baseColor}
              />
            </Box>
          </ListColumn>
        )}

        <ListColumn align="right" maxWidth={150} minWidth={150}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 0.5 }}>
              <FormattedNumber value={amount} variant="secondary14" color={baseColor} />
            </Box>
            <FormattedNumber
              value={amountInUSD}
              variant="secondary12"
              color={baseColor}
              symbol="USD"
              symbolsColor={baseColor}
            />
          </Box>
        </ListColumn>
      </Box>

      {userReserve.reserve.symbol === 'stETH' && (
        <Box sx={{ pl: '16px', width: '100%' }}>
          <StETHMigrationWarning
            v2Price={userReserve.reserve.priceInUSD}
            v2Amount={amount}
            v3Price={v3Rates?.priceInUSD}
          />
        </Box>
      )}
    </ListItem>
  );
};
