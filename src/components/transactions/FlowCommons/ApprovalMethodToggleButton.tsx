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
import { useState } from 'react';
import { ApprovalMethod } from 'src/store/walletSlice';

interface ApprovalMethodToggleButtonProps {
  currentMethod: ApprovalMethod;
  setMethod: (method: ApprovalMethod) => void;
  showBatchOption?: boolean;
}

export const ApprovalMethodToggleButton = ({
  currentMethod,
  setMethod,
  showBatchOption = false,
}: ApprovalMethodToggleButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
      >
        <Typography variant="subheader2" color="info.main">
          {currentMethod === ApprovalMethod.BATCH && <Trans>Batch Transaction</Trans>}
          {currentMethod === ApprovalMethod.PERMIT && <Trans>Signature</Trans>}
          {currentMethod === ApprovalMethod.APPROVE && <Trans>Transaction</Trans>}
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
        {showBatchOption && (
          <MenuItem
            onClick={() => {
              setMethod(ApprovalMethod.BATCH); 
              handleClose();
            }}
            selected={currentMethod === ApprovalMethod.BATCH}
          >
            <ListItemIcon>
              <SvgIcon>{currentMethod === ApprovalMethod.BATCH && <CheckIcon />}</SvgIcon>
            </ListItemIcon>
            <ListItemText>
              <Trans>Batch Transaction</Trans>
            </ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setMethod(ApprovalMethod.PERMIT); 
            handleClose();
          }}
          selected={currentMethod === ApprovalMethod.PERMIT}
        >
          <ListItemIcon>
          <SvgIcon>{currentMethod === ApprovalMethod.PERMIT && <CheckIcon />}</SvgIcon>
          </ListItemIcon>
          <ListItemText>
            <Trans>Signed Message</Trans>
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMethod(ApprovalMethod.APPROVE); 
            handleClose();
          }}
          selected={currentMethod === ApprovalMethod.APPROVE}
        >
          <ListItemIcon>
          <SvgIcon>{currentMethod === ApprovalMethod.APPROVE && <CheckIcon />}</SvgIcon>
          </ListItemIcon>
          <ListItemText>
            <Trans>Transaction</Trans>
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
