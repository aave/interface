import { Trans } from '@lingui/macro';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import StartIcon from '@mui/icons-material/Start';
import { useMediaQuery, useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { BigNumber } from 'ethers';
import { useState } from 'react';
import { WalletIcon } from 'src/components/icons/WalletIcon';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

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
  const { openUmbrella, openUmbrellaStakeCooldown, openUmbrellaUnstake, openUmbrellaClaim } =
    useModalContext();
  const now = useCurrentTimestamp(1);
  const { breakpoints, palette } = useTheme();
  const { addERC20Token } = useWeb3Context();

  const isMobile = useMediaQuery(breakpoints.down('lg'));

  const endOfCooldown = stakeData?.cooldownData.endOfCooldown || 0;
  const unstakeWindow = stakeData?.cooldownData.withdrawalWindow || 0;
  const cooldownTimeRemaining = endOfCooldown - now;

  const isCooldownActive = cooldownTimeRemaining > 0;
  const isUnstakeWindowActive = endOfCooldown < now && now < endOfCooldown + unstakeWindow;

  const availableToReactivateCooldown =
    isCooldownActive &&
    BigNumber.from(stakeData?.balances.stakeTokenRedeemableAmount || 0).gt(
      stakeData?.cooldownData.cooldownAmount || 0
    );

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
            onClick={() =>
              openUmbrella(
                stakeData.stakeToken,
                stakeData.stakeTokenSymbol,
                stakeData.waTokenData.waTokenAToken,
                stakeData.waTokenData.waTokenUnderlying
              )
            }
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
            {!isUnstakeWindowActive ? (
              <StyledMenuItem
                onClick={() => {
                  handleClose();
                  openUmbrellaStakeCooldown(stakeData.stakeToken, stakeData.stakeTokenSymbol);
                }}
                disabled={
                  isUnstakeWindowActive || (isCooldownActive && !availableToReactivateCooldown)
                }
              >
                <AccessTimeIcon />
                <Typography color="text.primary">
                  <Trans>Cooldown</Trans>
                </Typography>
              </StyledMenuItem>
            ) : (
              <StyledMenuItem
                onClick={() => {
                  handleClose();
                  openUmbrellaUnstake(stakeData.stakeToken, stakeData.stakeTokenSymbol);
                }}
                disabled={!isUnstakeWindowActive}
              >
                <StartIcon sx={{ transform: 'rotate(180deg)' }} />
                <Typography>Withdraw</Typography>
              </StyledMenuItem>
            )}

            <StyledMenuItem
              onClick={() => {
                handleClose();
                openUmbrella(
                  stakeData.stakeToken,
                  stakeData.stakeTokenSymbol,

                  stakeData.waTokenData.waTokenAToken,
                  stakeData.waTokenData.waTokenUnderlying
                );
              }}
            >
              <AddOutlinedIcon />
              <Typography>Stake more</Typography>
            </StyledMenuItem>

            <StyledMenuItem
              onClick={() => {
                handleClose();
                openUmbrellaClaim(stakeData.stakeToken);
              }}
            >
              <StartIcon />
              <Typography>Claim</Typography>
            </StyledMenuItem>

            <StyledMenuItem
              onClick={() => {
                addERC20Token({
                  address: stakeData.stakeToken,
                  decimals: stakeData.decimals,
                  symbol: stakeData.stakeTokenSymbol,
                });
              }}
            >
              <WalletIcon sx={{ width: '14px', height: '14px', stroke: palette.text.primary }} />
              <Typography>Add token to wallet</Typography>
            </StyledMenuItem>
          </Menu>
        </>
      )}
    </div>
  );
};
