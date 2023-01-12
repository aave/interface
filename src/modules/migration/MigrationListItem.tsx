import { InterestRate } from '@aave/contract-helpers';
import { ExclamationCircleIcon } from '@heroicons/react/outline';
import { ArrowNarrowRightIcon, CheckIcon } from '@heroicons/react/solid';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { Box, Button, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import { IncentivesCard } from 'src/components/incentives/IncentivesCard';
import { IsolatedBadge } from 'src/components/isolationMode/IsolatedBadge';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { NoData } from 'src/components/primitives/NoData';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ComputedUserReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { MigrationDisabled, V3Rates } from 'src/store/v3MigrationSelectors';

import { MigrationListMobileItem } from './MigrationListMobileItem';

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
  borrowApyType,
  userReserve,
  v3Rates,
}: MigrationListItemProps) => {
  const { breakpoints } = useTheme();
  const isDesktop = useMediaQuery(breakpoints.up('lg'));
  const isTablet = useMediaQuery(breakpoints.up('xsm'));
  const isMobile = useMediaQuery(breakpoints.down('xsm'));

  const assetColumnWidth =
    isMobile && !isTablet ? 45 : isTablet && !isDesktop ? 80 : isDesktop ? 120 : 80;

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
        borrowApyType={borrowApyType}
        userReserve={userReserve}
        v3Rates={v3Rates}
      />
    );

  return (
    <ListItem>
      <Box sx={{ display: 'flex', alignItems: 'center', py: 4 }}>
        <ListColumn align="center" maxWidth={60} minWidth={40}>
          <Box
            sx={(theme) => ({
              border: `2px solid ${Boolean(disabled) ? theme.palette.action.disabled : theme.palette.text.secondary
                }`,
              background: checked ? theme.palette.text.secondary : theme.palette.background.paper,
              width: 16,
              height: 16,
              borderRadius: '2px',
              cursor: Boolean(disabled) ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            })}
            onClick={Boolean(disabled) ? undefined : onCheckboxClick}
          >
            <SvgIcon sx={{ fontSize: '14px', color: 'background.paper' }}>
              <CheckIcon />
            </SvgIcon>
          </Box>
        </ListColumn>

        <ListColumn align="left" maxWidth={assetColumnWidth} minWidth={assetColumnWidth}>
          <Row>
            <TokenIcon symbol={userReserve.reserve.iconSymbol} fontSize="large" />

            <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
              <Typography variant="h4" noWrap>
                {userReserve.reserve.symbol}
              </Typography>
            </Box>
          </Row>
        </ListColumn>
      </Box>

      {!!enableAsCollateral && (
        <ListColumn align="right">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {userReserve.usageAsCollateralEnabledOnUser &&
              userReserve.reserve.usageAsCollateralEnabled ? (
              <CheckRoundedIcon fontSize="small" color="success" />
            ) : (
              <NoData variant="main14" color="text.secondary" />
            )}

            <SvgIcon sx={{ px: 1.5 }}>
              <ArrowNarrowRightIcon fontSize="14px" />
            </SvgIcon>
            {!enabledAsCollateral ? (
              <NoData variant="main14" color="text.secondary" />
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

      <ListColumn align="right">
        <Box sx={{ display: 'flex' }}>
          <IncentivesCard
            value={v2APY}
            symbol={userReserve.reserve.symbol}
            incentives={v2Incentives}
            variant="main14"
          />
          <SvgIcon sx={{ px: 1.5 }}>
            <ArrowNarrowRightIcon fontSize="14px" />
          </SvgIcon>
          <IncentivesCard
            value={v3APY}
            symbol={userReserve.reserve.symbol}
            incentives={v3Incentives}
            variant="main14"
          />
        </Box>
      </ListColumn>

      {!!borrowApyType && (
        <ListColumn align="right">
          <Box sx={{ display: 'flex' }}>
            <Button variant="outlined" size="small" sx={{ width: '50px', background: 'white' }}>
              <Typography variant="buttonS" color="primary">
                {borrowApyType}
              </Typography>
            </Button>
            <SvgIcon sx={{ px: 1.5 }}>
              <ArrowNarrowRightIcon fontSize="14px" />
            </SvgIcon>
            <Button variant="outlined" size="small" sx={{ width: '50px', background: 'white' }}>
              <Typography variant="buttonS" color="primary">
                Variable
              </Typography>
            </Button>
          </Box>
        </ListColumn>
      )}

      <ListColumn align="right" maxWidth={150} minWidth={150}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 0.5 }}>
            <FormattedNumber value={amount} variant="secondary14" />
          </Box>
          <FormattedNumber
            value={amountInUSD}
            variant="secondary12"
            color="text.secondary"
            symbol="USD"
          />
        </Box>
      </ListColumn>
    </ListItem>
  );
};
