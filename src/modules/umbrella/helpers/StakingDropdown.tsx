import { useState } from 'react';
import { useTheme } from '@mui/material';

import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { styled } from '@mui/material/styles';
import { useModalContext } from 'src/hooks/useModal';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';

// Styled component for the menu items to add gap between icon and text
const StyledMenuItem = styled(MenuItem)({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: 20,
  },
  '& .timeLabel': {
    marginLeft: 'auto',
    fontSize: '0.75rem',
    color: 'rgba(0, 0, 0, 0.6)',
  },
});

export const StakingDropdown = ({ stakeData }: { stakeData: MergedStakeData }) => {
  const { openUmbrella } = useModalContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  //   const handleStakeMoreClick = () => {
  //     handleClose();
  //     setStakeMoreModalOpen(true);
  //   };

  //   console.log('stakeData', stakeData);

  return (
    <div>
      <IconButton
        style={{
          backgroundColor: theme.palette.mode === 'light' ? '#F7F7F9' : '#383D51',
          borderRadius: 0,
        }}
        aria-label="more"
        aria-controls={open ? 'staking-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        size="medium"
      >
        <MoreHorizIcon />
      </IconButton>
      <Menu
        id="staking-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <StyledMenuItem>
          <TimerOutlinedIcon />
          <Typography color="text.primary">Cooldown...</Typography>
          <Typography className="timeLabel">1d</Typography>
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() => {
            handleClose();
            openUmbrella(stakeData.stakeToken, stakeData.stakeTokenSymbol);
          }}
        >
          <AddOutlinedIcon />
          <Typography>Stake more...</Typography>
        </StyledMenuItem>
        <StyledMenuItem>
          <ArrowForwardIcon />
          <Typography>Claim...</Typography>
        </StyledMenuItem>
      </Menu>
    </div>
  );
};
