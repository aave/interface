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
import { ApprovalMethod } from 'src/store/walletSlice';

interface ApprovalMethodToggleButtonProps {
  currentMethod: ApprovalMethod;
  setMethod: (newMethod: ApprovalMethod) => void;
}

export const ApprovalMethodToggleButton = ({
  currentMethod,
  setMethod,
}: ApprovalMethodToggleButtonProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box onClick={handleClick} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <Typography variant="subheader2" color="info.main">
          <Trans>{currentMethod}</Trans>
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
        <MenuItem
          selected={currentMethod === ApprovalMethod.PERMIT}
          value={ApprovalMethod.PERMIT}
          onClick={() => {
            if (currentMethod === ApprovalMethod.APPROVE) {
              setMethod(ApprovalMethod.PERMIT);
            }
            handleClose();
          }}
        >
          <ListItemText primaryTypographyProps={{ variant: 'subheader1' }}>
            <Trans>{ApprovalMethod.PERMIT}</Trans>
          </ListItemText>
          <ListItemIcon>
            <SvgIcon>{currentMethod === ApprovalMethod.PERMIT && <CheckIcon />}</SvgIcon>
          </ListItemIcon>
        </MenuItem>

        <MenuItem
          selected={currentMethod === ApprovalMethod.APPROVE}
          value={ApprovalMethod.APPROVE}
          onClick={() => {
            if (currentMethod === ApprovalMethod.PERMIT) {
              setMethod(ApprovalMethod.APPROVE);
            }
            handleClose();
          }}
        >
          <ListItemText primaryTypographyProps={{ variant: 'subheader1' }}>
            <Trans>{ApprovalMethod.APPROVE}</Trans>
          </ListItemText>
          <ListItemIcon>
            <SvgIcon>{currentMethod === ApprovalMethod.APPROVE && <CheckIcon />}</SvgIcon>
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </>
  );
};
