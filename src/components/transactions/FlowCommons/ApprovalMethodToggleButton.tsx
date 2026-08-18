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
import { ApprovalAmount, ApprovalMethod } from 'src/store/walletSlice';

interface ApprovalMethodToggleButtonProps {
  currentMethod: ApprovalMethod;
  setMethod: (newMethod: ApprovalMethod) => void;
  /**
   * When set, the transaction option splits into exact / unlimited. Flows that leave this
   * off keep the original two-option menu.
   */
  showAmountOptions?: boolean;
  currentAmount?: ApprovalAmount;
  setAmount?: (newAmount: ApprovalAmount) => void;
  /** Permit is unavailable for plenty of tokens; the menu still has to render without it. */
  permitAvailable?: boolean;
}

export const ApprovalMethodToggleButton = ({
  currentMethod,
  setMethod,
  showAmountOptions = false,
  currentAmount = ApprovalAmount.UNLIMITED,
  setAmount,
  permitAvailable = true,
}: ApprovalMethodToggleButtonProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const usingPermit = currentMethod === ApprovalMethod.PERMIT;

  const selectTransaction = (amount: ApprovalAmount) => {
    if (currentMethod === ApprovalMethod.PERMIT) {
      setMethod(ApprovalMethod.APPROVE);
    }
    if (setAmount && currentAmount !== amount) {
      setAmount(amount);
    }
    handleClose();
  };

  const buttonLabel = () => {
    if (usingPermit) return <Trans>Signed message</Trans>;
    if (!showAmountOptions) return <Trans>Transaction</Trans>;
    return currentAmount === ApprovalAmount.EXACT ? (
      <Trans>Transaction · exact</Trans>
    ) : (
      <Trans>Transaction · unlimited</Trans>
    );
  };

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        data-cy={`approveButtonChange`}
      >
        <Typography variant="subheader2" color="info.main">
          {buttonLabel()}
        </Typography>
        <SvgIcon sx={{ fontSize: 16, ml: 1, color: 'info.main' }}>
          <CogIcon />
        </SvgIcon>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        keepMounted={true}
        data-cy={`approveMenu_${currentMethod}`}
      >
        {permitAvailable && (
          <MenuItem
            data-cy={`approveOption_${ApprovalMethod.PERMIT}`}
            selected={usingPermit}
            value={ApprovalMethod.PERMIT}
            onClick={() => {
              if (currentMethod === ApprovalMethod.APPROVE) {
                setMethod(ApprovalMethod.PERMIT);
              }
              handleClose();
            }}
          >
            <ListItemText primaryTypographyProps={{ variant: 'subheader1' }}>
              <Trans>Signed message</Trans>
            </ListItemText>
            <ListItemIcon>
              <SvgIcon>{usingPermit && <CheckIcon />}</SvgIcon>
            </ListItemIcon>
          </MenuItem>
        )}

        {showAmountOptions && (
          <MenuItem
            data-cy={`approveOption_Transaction_exact`}
            selected={!usingPermit && currentAmount === ApprovalAmount.EXACT}
            value={ApprovalMethod.APPROVE}
            onClick={() => selectTransaction(ApprovalAmount.EXACT)}
          >
            <ListItemText primaryTypographyProps={{ variant: 'subheader1' }}>
              <Trans>Transaction · exact amount</Trans>
            </ListItemText>
            <ListItemIcon>
              <SvgIcon>
                {!usingPermit && currentAmount === ApprovalAmount.EXACT && <CheckIcon />}
              </SvgIcon>
            </ListItemIcon>
          </MenuItem>
        )}

        {/*
          Keeps the data-cy the existing Cypress steps click, and stays the unlimited
          option so those flows behave as they did before.
        */}
        <MenuItem
          data-cy={`approveOption_${ApprovalMethod.APPROVE}`}
          selected={
            !usingPermit && (!showAmountOptions || currentAmount === ApprovalAmount.UNLIMITED)
          }
          value={ApprovalMethod.APPROVE}
          onClick={() => selectTransaction(ApprovalAmount.UNLIMITED)}
        >
          <ListItemText primaryTypographyProps={{ variant: 'subheader1' }}>
            {showAmountOptions ? (
              <Trans>Transaction · unlimited</Trans>
            ) : (
              <Trans>Transaction</Trans>
            )}
          </ListItemText>
          <ListItemIcon>
            <SvgIcon>
              {!usingPermit &&
                (!showAmountOptions || currentAmount === ApprovalAmount.UNLIMITED) && <CheckIcon />}
            </SvgIcon>
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </>
  );
};
