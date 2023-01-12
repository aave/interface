import { ArrowNarrowRightIcon, CheckIcon } from '@heroicons/react/solid';
import { Box, Button, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { MigrationDisabled, MigrationUserReserve } from 'src/store/v3MigrationSelectors';

import { ListItemUsedAsCollateral } from '../dashboard/lists/ListItemUsedAsCollateral';

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
  userReserve: MigrationUserReserve;
}

export const MigrationListItem = ({
  checked,
  amount,
  amountInUSD,
  onCheckboxClick,
  enabledAsCollateral,
  disabled,
  enableAsCollateral,
  canBeEnforced,
  isIsolated,
  borrowApyType,
  userReserve,
}: MigrationListItemProps) => {
  const { breakpoints } = useTheme();
  const isDesktop = useMediaQuery(breakpoints.up('lg'));
  const isTablet = useMediaQuery(breakpoints.up('xsm'));
  const isMobile = useMediaQuery(breakpoints.up('xs'));

  const assetColumnWidth =
    isMobile && !isTablet ? 45 : isTablet && !isDesktop ? 80 : isDesktop ? 180 : 80;

  return (
    <ListItem>
      <ListColumn align="center" maxWidth={isDesktop ? 60 : 40} minWidth={40}>
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
          {isTablet && <TokenIcon symbol={userReserve.reserve.iconSymbol} fontSize="large" />}

          <Box sx={{ pl: isTablet ? 3.5 : 0, overflow: 'hidden' }}>
            <Typography variant="h4" noWrap>
              {userReserve.reserve.symbol}
            </Typography>
          </Box>
        </Row>
      </ListColumn>

      {!!enableAsCollateral && (
        <ListColumn>
          <ListItemUsedAsCollateral
            canBeEnabledAsCollateral={true}
            disabled={!canBeEnforced}
            usageAsCollateralEnabledOnUser={enabledAsCollateral || false}
            isIsolated={isIsolated || false}
            onToggleSwitch={enableAsCollateral}
          />
        </ListColumn>
      )}

      <ListColumn align="right">
        <Box sx={{ display: 'flex' }}>
          <FormattedNumber value={'0'} percent variant="main14" />
          <SvgIcon sx={{ px: 1.5 }}>
            <ArrowNarrowRightIcon fontSize="14px" />
          </SvgIcon>
          <FormattedNumber value={'0'} percent variant="main14" />
        </Box>
      </ListColumn>

      {!!borrowApyType && (
        <ListColumn align="right" maxWidth={assetColumnWidth} minWidth={assetColumnWidth}>
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

      <ListColumn align="right">
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
