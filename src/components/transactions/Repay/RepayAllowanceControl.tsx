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
    // flexShrink: 0 is what makes the parent row wrap this onto its own line instead of
    // squeezing it; maxWidth then caps it at the row, so a very long amount breaks rather
    // than overflowing. Shrinking first would let the digits break while space remains.
    <Box
      sx={{ display: 'inline-flex', alignItems: 'center', mb: 2, maxWidth: '100%', flexShrink: 0 }}
    >
      <Typography variant="subheader2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
        <Trans>Allowance</Trans>&nbsp;
      </Typography>
      <Box
        onClick={(event: React.MouseEvent<HTMLDivElement>) => setAnchorEl(event.currentTarget)}
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', minWidth: 0 }}
        data-cy="repayAllowanceChange"
      >
        <Typography
          variant="subheader2"
          color="info.main"
          component="span"
          // A full-precision 18-decimal amount is long. Breaking it is the last resort, once
          // the row has already wrapped the control onto a line of its own.
          sx={{ wordBreak: 'break-word' }}
        >
          {isExact ? `${exactAmount} ${symbol}` : <Trans>Unlimited</Trans>}
        </Typography>
        <SvgIcon sx={{ fontSize: 16, ml: 1, color: 'info.main', flexShrink: 0 }}>
          <CogIcon />
        </SvgIcon>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        keepMounted={true}
        data-cy={`repayAllowanceMenu_${allowance}`}
        PaperProps={{ sx: { maxWidth: 'min(360px, calc(100vw - 32px))' } }}
        // MenuItem is nowrap by default, which clips the amount off the right edge on mobile.
        MenuListProps={{ sx: { '& .MuiMenuItem-root': { whiteSpace: 'normal' } } }}
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
          <ListItemIcon sx={{ alignSelf: 'flex-start', mt: 1 }}>
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
          <ListItemIcon sx={{ alignSelf: 'flex-start', mt: 1 }}>
            <SvgIcon>{!isExact && <CheckIcon />}</SvgIcon>
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </Box>
  );
};
