import { Trans } from '@lingui/macro';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import StartIcon from '@mui/icons-material/Start';
import { Button, Stack, useMediaQuery, useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { BigNumber } from 'ethers';
import { useState } from 'react';
import { SecondsToString } from 'src/components/SecondsToString';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { STAKE } from 'src/utils/events';

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
  const trackEvent = useRootStore((store) => store.trackEvent);
  const now = useCurrentTimestamp(1);
  const { breakpoints } = useTheme();

  const isMobile = useMediaQuery(breakpoints.down('lg'));

  const endOfCooldown = stakeData?.cooldownData.endOfCooldown || 0;
  const unstakeWindow = stakeData?.cooldownData.withdrawalWindow || 0;
  const cooldownTimeRemaining = endOfCooldown - now;
  const unstakeTimeRemaining = endOfCooldown + unstakeWindow - now;

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

  const { totalAvailableToStake } = stakeData.formattedBalances;

  const hasUnclaimedRewards = stakeData.formattedRewards.some(
    (reward) => Number(reward.accrued) > 0
  );

  const hasStakeTokenBalance = stakeData.balances.stakeTokenBalance !== '0';
  return (
    <div>
      {!hasStakeTokenBalance && !hasUnclaimedRewards ? (
        <Button
          disabled={totalAvailableToStake === '0'}
          fullWidth={isMobile}
          variant="contained"
          onClick={() => {
            trackEvent(STAKE.STAKE_TOKEN, {
              action: STAKE.OPEN_STAKE_MODAL,
              asset: stakeData.symbol,
              tokenAddress: stakeData.tokenAddress,
              type: 'Initial Stake',
            });
            openUmbrella(
              stakeData.tokenAddress,
              stakeData.underlyingTokenAddress,
              stakeData.symbol,
              stakeData.stataTokenData.aToken,
              stakeData.stataTokenData.asset
            );
          }}
        >
          <Trans>Stake</Trans>
        </Button>
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
                  trackEvent(STAKE.STAKE_TOKEN, {
                    action: STAKE.OPEN_COOLDOWN_MODAL,
                    asset: stakeData.symbol,
                    tokenAddress: stakeData.tokenAddress,
                    isCooldownActive,
                    availableToReactivateCooldown,
                  });
                  openUmbrellaStakeCooldown(stakeData.tokenAddress, stakeData.symbol);
                }}
                disabled={
                  !hasStakeTokenBalance ||
                  isUnstakeWindowActive ||
                  (isCooldownActive && !availableToReactivateCooldown)
                }
              >
                <AccessTimeIcon />
                {isCooldownActive && !availableToReactivateCooldown ? (
                  <Stack
                    sx={{ width: '100%' }}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography color="text.primary">
                      <Trans>Cooling down</Trans>
                    </Typography>
                    <Typography variant="helperText">
                      <SecondsToString seconds={cooldownTimeRemaining} />
                    </Typography>
                  </Stack>
                ) : (
                  <Trans>Cooldown to unstake</Trans>
                )}
              </StyledMenuItem>
            ) : (
              <StyledMenuItem
                onClick={() => {
                  handleClose();
                  trackEvent(STAKE.STAKE_TOKEN, {
                    action: STAKE.OPEN_WITHDRAW_MODAL,
                    asset: stakeData.symbol,
                    tokenAddress: stakeData.tokenAddress,
                    isUnstakeWindowActive,
                    unstakeTimeRemaining,
                  });
                  openUmbrellaUnstake(
                    stakeData.tokenAddress,
                    stakeData.underlyingTokenAddress,
                    stakeData.stataTokenData.asset,
                    stakeData.symbol
                  );
                }}
                disabled={!isUnstakeWindowActive}
              >
                <StartIcon sx={{ transform: 'rotate(180deg)' }} />
                <Stack
                  sx={{ width: '100%' }}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography color="text.primary">
                    <Trans>Withdraw</Trans>
                  </Typography>
                  <Typography variant="helperText">
                    <SecondsToString seconds={unstakeTimeRemaining} />
                  </Typography>
                </Stack>
              </StyledMenuItem>
            )}

            <StyledMenuItem
              onClick={() => {
                handleClose();
                trackEvent(STAKE.STAKE_TOKEN, {
                  action: STAKE.OPEN_STAKE_MODAL,
                  asset: stakeData.symbol,
                  tokenAddress: stakeData.tokenAddress,
                  type: hasStakeTokenBalance ? 'Stake More' : 'Initial Stake',
                });
                openUmbrella(
                  stakeData.tokenAddress,
                  stakeData.underlyingTokenAddress,
                  stakeData.symbol,
                  stakeData.stataTokenData.aToken,
                  stakeData.stataTokenData.asset
                );
              }}
            >
              <AddOutlinedIcon />
              <Typography>{hasStakeTokenBalance ? 'Stake more' : 'Stake'}</Typography>
            </StyledMenuItem>

            <StyledMenuItem
              onClick={() => {
                handleClose();
                trackEvent(STAKE.STAKE_TOKEN, {
                  action: STAKE.OPEN_CLAIM_MODAL,
                  asset: stakeData.symbol,
                  tokenAddress: stakeData.tokenAddress,
                  hasUnclaimedRewards,
                });
                openUmbrellaClaim(stakeData.tokenAddress);
              }}
            >
              <StartIcon />
              <Typography>Claim</Typography>
            </StyledMenuItem>

            {/* The RPC method for adding tokens requires the symbol to be less than 11 characters.
                The umbrella stake tokens have symbols such as stkwaBasSepUSDT.V1, so removing this
                option for now.
            <StyledMenuItem
              onClick={() => {
                addERC20Token({
                  address: stakeData.tokenAddress,
                  decimals: stakeData.decimals,
                  symbol: stakeData.symbol,
                });
              }}
            >
              <WalletIcon sx={{ width: '14px', height: '14px', stroke: palette.text.primary }} />
              <Typography>Add token to wallet</Typography>
            </StyledMenuItem> */}
          </Menu>
        </>
      )}
    </div>
  );
};
