import { CheckIcon } from '@heroicons/react/outline';
import { CogIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import {
  Box,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  SvgIcon,
  Typography,
} from '@mui/material';
import * as React from 'react';

export enum RepayAllowance {
  EXACT = 'exact',
  UNLIMITED = 'unlimited',
}

interface RepayAllowanceControlProps {
  allowance: RepayAllowance;
  setAllowance: (allowance: RepayAllowance) => void;
  /** Full-precision amount that will be approved when EXACT is selected. */
  exactAmount: string;
  symbol: string;
}

/**
 * Repay's own allowance picker, rather than an option on the shared
 * ApprovalMethodToggleButton. Being Repay-specific is the point: it knows the amount, so
 * it can show the figure the approval gate is asking for. That number is otherwise
 * invisible, which is what left users re-approving an allowance they thought was ample.
 */
export const RepayAllowanceControl = ({
  allowance,
  setAllowance,
  exactAmount,
  symbol,
}: RepayAllowanceControlProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isExact = allowance === RepayAllowance.EXACT;

  const select = (next: RepayAllowance) => {
    setAllowance(next);
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', mb: 2 }}>
      <Typography variant="subheader2" color="text.secondary">
        <Trans>Allowance</Trans>&nbsp;
      </Typography>
      <Box
        onClick={(event: React.MouseEvent<HTMLDivElement>) => setAnchorEl(event.currentTarget)}
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        data-cy="repayAllowanceChange"
      >
        <Typography variant="subheader2" color="info.main" component="span">
          {isExact ? `${exactAmount} ${symbol}` : <Trans>Unlimited</Trans>}
        </Typography>
        <SvgIcon sx={{ fontSize: 16, ml: 1, color: 'info.main' }}>
          <CogIcon />
        </SvgIcon>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        keepMounted={true}
        data-cy={`repayAllowanceMenu_${allowance}`}
      >
        <MenuItem
          data-cy="repayAllowanceOption_exact"
          selected={isExact}
          onClick={() => select(RepayAllowance.EXACT)}
        >
          <ListItemText
            primaryTypographyProps={{ variant: 'subheader1' }}
            secondaryTypographyProps={{ variant: 'caption' }}
            secondary={
              <Trans>
                {exactAmount} {symbol} — covers interest accruing before the transaction lands
              </Trans>
            }
          >
            <Trans>Exact amount</Trans>
          </ListItemText>
          <ListItemIcon>
            <SvgIcon>{isExact && <CheckIcon />}</SvgIcon>
          </ListItemIcon>
        </MenuItem>

        <MenuItem
          data-cy="repayAllowanceOption_unlimited"
          selected={!isExact}
          onClick={() => select(RepayAllowance.UNLIMITED)}
        >
          <ListItemText
            primaryTypographyProps={{ variant: 'subheader1' }}
            secondaryTypographyProps={{ variant: 'caption' }}
            secondary={<Trans>No further approvals needed for future repays</Trans>}
          >
            <Trans>Unlimited</Trans>
          </ListItemText>
          <ListItemIcon>
            <SvgIcon>{!isExact && <CheckIcon />}</SvgIcon>
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </Box>
  );
};
