import { SwitchHorizontalIcon } from '@heroicons/react/outline';
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
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.7,
          },
        }}
        onClick={handleClick}
      >
        <Typography variant="subheader2" color="text.secondary">
          {currentMethod === ApprovalMethod.BATCH && <Trans>Batch Transaction</Trans>}
          {currentMethod === ApprovalMethod.PERMIT && <Trans>Signature</Trans>}
          {currentMethod === ApprovalMethod.APPROVE && <Trans>Transaction</Trans>}
        </Typography>
        <SvgIcon sx={{ ml: '2px', fontSize: '11px' }}>
          <SwitchHorizontalIcon />
        </SvgIcon>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {showBatchOption && (
          <MenuItem
            onClick={() => setMethod(ApprovalMethod.BATCH)}
            selected={currentMethod === ApprovalMethod.BATCH}
          >
            <ListItemIcon>
              <SvgIcon sx={{ fontSize: 20 }}>
                <SwitchHorizontalIcon />
              </SvgIcon>
            </ListItemIcon>
            <ListItemText>
              <Trans>Batch Transaction</Trans>
            </ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => setMethod(ApprovalMethod.PERMIT)}
          selected={currentMethod === ApprovalMethod.PERMIT}
        >
          <ListItemIcon>
            <SvgIcon sx={{ fontSize: 20 }}>
              <SwitchHorizontalIcon />
            </SvgIcon>
          </ListItemIcon>
          <ListItemText>
            <Trans>Signature</Trans>
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => setMethod(ApprovalMethod.APPROVE)}
          selected={currentMethod === ApprovalMethod.APPROVE}
        >
          <ListItemIcon>
            <SvgIcon sx={{ fontSize: 20 }}>
              <SwitchHorizontalIcon />
            </SvgIcon>
          </ListItemIcon>
          <ListItemText>
            <Trans>Transaction</Trans>
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
