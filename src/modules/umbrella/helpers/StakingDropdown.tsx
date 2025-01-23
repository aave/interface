import { Trans } from '@lingui/macro';
import AddIcon from '@mui/icons-material/Add';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import { useMediaQuery, useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
// import { BigNumber } from 'ethers';
import { useState } from 'react';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { useModalContext } from 'src/hooks/useModal';

import { SecondsToString } from '../../staking/StakingPanel';

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
  const { openUmbrella, openUmbrellaStakeCooldown } = useModalContext();
  const now = useCurrentTimestamp(1);
  const { breakpoints } = useTheme();

  const isMobile = useMediaQuery(breakpoints.down('lg'));
  const cooldownSeconds = stakeData?.cooldownSeconds || 0;
  const endOfCooldown = stakeData?.cooldownData.endOfCooldown || 0;
  const unstakeWindow = stakeData?.cooldownData.withdrawalWindow || 0;
  const cooldownTimeRemaining = endOfCooldown - now;
  const unstakeTimeRemaining = endOfCooldown + unstakeWindow - now;

  const isCooldownActive = cooldownTimeRemaining > 0;
  const isUnstakeWindowActive = endOfCooldown < now && now < endOfCooldown + unstakeWindow;

  //   const availableToReactivateCooldown =
  //     isCooldownActive &&
  //     BigNumber.from(stakeData?.balances.stakeTokenRedeemableAmount || 0).gt(
  //       stakeData?.cooldownData.cooldownAmount || 0
  //     );

  //   console.log('stakeData', stakeData);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      {stakeData.balances.stakeTokenBalance === '0' ? (
        <>
          <IconButton
            style={{
              borderRadius: 4,
              width: isMobile ? '100%' : 'auto',
              color: '#FFFFFF',
              backgroundColor: theme.palette.mode === 'light' ? '#383D51' : '#383D51',
            }}
            onClick={() => openUmbrella(stakeData.stakeToken, stakeData.stakeTokenSymbol)}
            size="medium"
          >
            <AddIcon />
          </IconButton>
        </>
      ) : (
        <>
          <IconButton
            style={{
              width: isMobile ? '100%' : 'auto',

              backgroundColor: theme.palette.mode === 'light' ? '#F7F7F9' : '#383D51',
              borderRadius: 4,
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
            <StyledMenuItem
              onClick={() => {
                handleClose();
                openUmbrellaStakeCooldown(stakeData.stakeToken, stakeData.stakeTokenSymbol);
              }}
            >
              <TimerOutlinedIcon />
              <Typography color="text.primary">
                <CooldownLabel
                  isCooldownActive={isCooldownActive}
                  isUnstakeWindowActive={isUnstakeWindowActive}
                  unstakeTimeRemaining={unstakeTimeRemaining}
                  cooldownTimeRemaining={cooldownTimeRemaining}
                  cooldownSeconds={cooldownSeconds}
                />
              </Typography>

              {/* <Typography className="timeLabel">1d</Typography> */}
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
        </>
      )}
    </div>
  );
};

const CooldownLabel = ({
  isCooldownActive,
  isUnstakeWindowActive,
  unstakeTimeRemaining,
  cooldownTimeRemaining,
  cooldownSeconds,
}: {
  isCooldownActive: boolean;
  isUnstakeWindowActive: boolean;
  unstakeTimeRemaining: number;
  cooldownTimeRemaining: number;
  cooldownSeconds: number;
}) => {
  if (!isCooldownActive) return <Trans>Cooldown</Trans>;

  if (isUnstakeWindowActive) {
    return (
      <>
        <Trans>Time left to unstake</Trans>
        <span className="timeLabel">
          <SecondsToString seconds={unstakeTimeRemaining} />
        </span>
      </>
    );
  }

  if (isCooldownActive) {
    return (
      <>
        <Trans>Cooldown time left</Trans>
        <span className="timeLabel">
          <SecondsToString seconds={cooldownTimeRemaining} />
        </span>
      </>
    );
  }

  return (
    <>
      <Trans>Cooldown period</Trans>
      <span className="timeLabel">
        <SecondsToString seconds={cooldownSeconds} />
      </span>
    </>
  );
};
