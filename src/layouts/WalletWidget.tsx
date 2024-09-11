import { DuplicateIcon } from '@heroicons/react/outline';
import { ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CallMadeOutlinedIcon from '@mui/icons-material/CallMadeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Skeleton,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { AvatarSize } from 'src/components/Avatar';
import { CompactMode } from 'src/components/CompactableTypography';
import { Warning } from 'src/components/primitives/Warning';
import { UserDisplay } from 'src/components/UserDisplay';
import { WalletModal } from 'src/components/WalletConnection/WalletModal';
import { SCAN_TRANSACTION_TON } from 'src/hooks/app-data-provider/useAppDataProviderTon';
import { useWalletModalContext } from 'src/hooks/useWalletModal';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { AUTH, GENERAL } from 'src/utils/mixPanelEvents';

import { Link } from '../components/primitives/Link';
import { ENABLE_TESTNET, getNetworkConfig, STAGING_ENV } from '../utils/marketsAndNetworksConfig';
import { DrawerWrapper } from './components/DrawerWrapper';
import { MobileCloseButton } from './components/MobileCloseButton';

interface WalletWidgetProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  headerHeight: number;
}

export default function WalletWidget({ open, setOpen, headerHeight }: WalletWidgetProps) {
  const { disconnectWallet, currentAccount, connected, chainId, loading, readOnlyModeAddress } =
    useWeb3Context();
  const { disconnectTonWallet, isConnectedTonWallet, walletAddressTonWallet } =
    useTonConnectContext();

  const { setWalletModalOpen } = useWalletModalContext();
  const theme = useTheme();
  const { breakpoints, palette } = useTheme();
  const xsm = useMediaQuery(breakpoints.down('xsm'));
  const md = useMediaQuery(breakpoints.down('md'));
  const trackEvent = useRootStore((store) => store.trackEvent);

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const networkConfig = getNetworkConfig(chainId);
  let networkColor = '';
  if (networkConfig?.isFork) {
    networkColor = '#ff4a8d';
  } else if (networkConfig?.isTestnet) {
    networkColor = '#7157ff';
  } else {
    networkColor = '#65c970';
  }

  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!connected && !isConnectedTonWallet) {
      trackEvent(GENERAL.OPEN_MODAL, { modal: 'Connect Waller' });
      setWalletModalOpen(true);
    } else {
      setOpen(true);
      setAnchorEl(event.currentTarget);
    }
  };

  const handleDisconnect = () => {
    if (connected) {
      disconnectWallet();
      trackEvent(AUTH.DISCONNECT_WALLET);
      handleClose();
    } else if (isConnectedTonWallet) {
      disconnectTonWallet();
      trackEvent(AUTH.DISCONNECT_WALLET);
      handleClose();
    }
  };

  const handleCopy = async () => {
    navigator.clipboard.writeText(currentAccount || walletAddressTonWallet);
    trackEvent(AUTH.COPY_ADDRESS);
    handleClose();
  };

  const handleSwitchWallet = (): void => {
    setWalletModalOpen(true);
    trackEvent(AUTH.SWITCH_WALLET);
    handleClose();
  };

  const handleViewOnExplorer = (): void => {
    trackEvent(GENERAL.EXTERNAL_LINK, { Link: 'Etherscan for Wallet' });
    handleClose();
  };

  const hideWalletAccountText = xsm && (ENABLE_TESTNET || STAGING_ENV || readOnlyModeAddress);

  const Content = ({ component = ListItem }: { component?: typeof MenuItem | typeof ListItem }) => (
    <>
      <Typography
        variant="subheader2"
        sx={{
          display: { xs: 'block', md: 'none' },
          color: '#A5A8B6',
          px: 4,
          py: 2,
        }}
      >
        <Trans>Account</Trans>
      </Typography>

      <Box component={component} disabled sx={{ p: 0, ml: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '44px',
          }}
        >
          <UserDisplay
            avatarProps={{ size: AvatarSize.LG }}
            titleProps={{
              typography: 'h4',
              addressCompactMode: CompactMode.MD,
            }}
            subtitleProps={{
              addressCompactMode: CompactMode.LG,
              typography: 'caption',
            }}
          />
          {readOnlyModeAddress && (
            <Warning
              severity="warning"
              sx={{ mt: 3, mb: 0, ...(md ? { background: '#301E04', color: '#FFDCA8' } : {}) }}
            >
              <Trans>Read-only mode.</Trans>
            </Warning>
          )}
        </Box>
      </Box>
      <Divider sx={{ my: { xs: 7, md: 0 }, borderColor: { xs: '#FFFFFF1F', md: 'divider' } }} />

      <Box component={component} disabled>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 5,
            }}
          >
            <Typography variant="caption" color={{ xs: '#FFFFFFB2', md: 'text.secondary' }}>
              <Trans>Network</Trans>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                bgcolor: networkColor,
                width: 6,
                height: 6,
                mr: 2,
                boxShadow: '0px 2px 1px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25)',
                borderRadius: '50%',
              }}
            />
            <Typography color={{ xs: '#F1F1F3', md: 'text.primary' }} variant="subheader1">
              {isConnectedTonWallet ? 'TON' : networkConfig.name}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ my: { xs: 7, md: 0 }, borderColor: { xs: '#FFFFFF1F', md: 'divider' } }} />

      <Box
        component={component}
        sx={{
          color: { xs: '#F1F1F3', md: 'text.primary', cursor: 'pointer' },
          height: '48px',
          py: 1.5,
        }}
        onClick={handleCopy}
      >
        <ListItemIcon
          sx={{
            color: theme.palette.text.primary,
          }}
        >
          <SvgIcon fontSize="small">
            <DuplicateIcon />
          </SvgIcon>
        </ListItemIcon>
        <ListItemText>
          <Box sx={{ fontSize: '17px', color: theme.palette.text.secondary }}>
            <Trans>Copy address</Trans>
          </Box>
        </ListItemText>
      </Box>
      <Divider sx={{ my: { xs: 7, md: 0 }, borderColor: { xs: '#FFFFFF1F', md: 'divider' } }} />
      <Link href={networkConfig.explorerLinkBuilder({ address: currentAccount })}>
        <Box
          component={component}
          sx={{
            color: { xs: '#F1F1F3', md: theme.palette.text.primary },
            height: '48px',
            display: 'flex',
            py: 1.5,
          }}
          onClick={handleViewOnExplorer}
        >
          <ListItemText>
            <Box
              sx={{ fontSize: '16px', color: theme.palette.text.primary, pl: 8, fontWeight: 600 }}
            >
              <Trans>E24C0234B9</Trans>
            </Box>
          </ListItemText>
          <ListItemIcon
            sx={{
              color: theme.palette.text.primary,
              pl: 4,
              mr: 0,
            }}
          >
            <SvgIcon fontSize="small">
              <ArrowForwardIosIcon />
            </SvgIcon>
          </ListItemIcon>
        </Box>
      </Link>
      <Link href={networkConfig.explorerLinkBuilder({ address: currentAccount })}>
        <Box
          component={component}
          sx={{
            color: { xs: '#F1F1F3', md: theme.palette.text.primary },
            height: '48px',
            p: '6px 12px',
          }}
          onClick={handleViewOnExplorer}
        >
          <ListItemIcon
            sx={{
              color: theme.palette.text.primary,
              p: 0,
              lineHeight: 1.3,
            }}
          >
            <SvgIcon fontSize="small">
              <AccountCircleOutlinedIcon />
            </SvgIcon>
          </ListItemIcon>
          <ListItemText>
            <Box
              sx={{ fontSize: '17px', color: theme.palette.text.secondary, p: 0, lineHeight: 1.3 }}
            >
              <Trans>Copy referral code</Trans>
            </Box>
          </ListItemText>
        </Box>
      </Link>
      <Divider sx={{ my: { xs: 7, md: 0 }, borderColor: { xs: '#FFFFFF1F', md: 'divider' } }} />
      {networkConfig?.explorerLinkBuilder && (
        <Link
          href={
            isConnectedTonWallet
              ? `${SCAN_TRANSACTION_TON}/${currentAccount}`
              : networkConfig.explorerLinkBuilder({ address: currentAccount })
          }
        >
          <Box
            component={component}
            sx={{
              color: { xs: '#F1F1F3', md: theme.palette.text.primary },
              height: '48px',
              p: '6px 12px',
            }}
            onClick={handleViewOnExplorer}
          >
            <ListItemIcon
              sx={{
                color: theme.palette.text.primary,
              }}
            >
              <SvgIcon fontSize="small">
                <CallMadeOutlinedIcon />
              </SvgIcon>
            </ListItemIcon>
            <ListItemText>
              <Box sx={{ fontSize: '17px', color: theme.palette.text.secondary }}>
                <Trans>View on Explorer</Trans>
              </Box>
            </ListItemText>
          </Box>
        </Link>
      )}
      <Divider sx={{ my: { xs: 7, md: 0 }, borderColor: { xs: '#FFFFFF1F', md: 'divider' } }} />
      {!md && (
        <Box
          component={component}
          sx={{
            color: { xs: '#F1F1F3', md: 'text.primary', cursor: 'pointer' },
            height: '48px',
            py: 1.5,
          }}
          onClick={handleDisconnect}
        >
          <ListItemIcon
            sx={{
              color: theme.palette.text.primary,
            }}
          >
            <SvgIcon fontSize="small">
              <LogoutOutlinedIcon />
            </SvgIcon>
          </ListItemIcon>
          <ListItemText>
            <Box sx={{ fontSize: '17px', color: theme.palette.text.secondary }}>
              <Trans>Disconnect</Trans>
            </Box>
          </ListItemText>
        </Box>
        // <Box>
        //   <Button
        //     variant="outlined"
        //     sx={{
        //       padding: '0 5px',
        //       boxShadow: '0px 2px 1px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25)',
        //     }}
        //     size="small"
        //     onClick={handleDisconnect}
        //     data-cy={`disconnect-wallet`}
        //   >
        //     Disconnect
        //   </Button>
        // </Box>
        // <Box sx={{ display: 'flex', flexDirection: 'row', padding: '0 16px 10px' }}>
        //   <Button
        //     variant="outlined"
        //     sx={{
        //       padding: '0 5px',
        //       marginRight: '10px',
        //     }}
        //     size="small"
        //     onClick={handleSwitchWallet}
        //   >
        //     Switch wallet
        //   </Button>
        // </Box>
      )}
      {md && (
        <>
          <Divider sx={{ my: { xs: 7, md: 0 }, borderColor: { xs: '#FFFFFF1F', md: 'divider' } }} />
          <Box sx={{ padding: '16px 16px 10px' }}>
            <Button
              sx={{
                marginBottom: '16px',
                background: '#383D51',
                color: '#F1F1F3',
              }}
              fullWidth
              size="large"
              variant={palette.mode === 'dark' ? 'outlined' : 'text'}
              onClick={handleSwitchWallet}
            >
              Switch wallet
            </Button>
            <Button
              sx={{
                background: '#383D51',
                color: '#F1F1F3',
              }}
              fullWidth
              size="large"
              variant={palette.mode === 'dark' ? 'outlined' : 'text'}
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </Box>
        </>
      )}
    </>
  );

  return (
    <>
      {md && (connected || isConnectedTonWallet) && open ? (
        <MobileCloseButton setOpen={setOpen} />
      ) : loading && !isConnectedTonWallet ? (
        <Skeleton height={36} width={126} />
      ) : (
        <Button
          variant={connected || isConnectedTonWallet ? 'surface' : 'gradient'}
          aria-label="wallet"
          id="wallet-button"
          aria-controls={open ? 'wallet-button' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleClick}
          sx={{
            p: connected || isConnectedTonWallet ? '12px' : undefined,
            minWidth: hideWalletAccountText ? 'unset' : undefined,
            height: '48px',
          }}
          endIcon={
            (connected || isConnectedTonWallet) &&
            !hideWalletAccountText &&
            !md && (
              <SvgIcon
                sx={{
                  display: { xs: 'none', md: 'block' },
                }}
              >
                {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </SvgIcon>
            )
          }
        >
          {connected || isConnectedTonWallet ? (
            <UserDisplay
              avatarProps={{ size: AvatarSize.SM }}
              oneLiner={true}
              titleProps={{ variant: 'buttonM' }}
            />
          ) : (
            <Trans>Connect wallet</Trans>
          )}
        </Button>
      )}

      {md ? (
        <DrawerWrapper open={open} setOpen={setOpen} headerHeight={headerHeight}>
          <List sx={{ px: 2, '.MuiListItem-root.Mui-disabled': { opacity: 1 } }}>
            <Content />
          </List>
        </DrawerWrapper>
      ) : (
        <Menu
          id="wallet-menu"
          MenuListProps={{
            'aria-labelledby': 'wallet-button',
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          keepMounted={true}
        >
          <MenuList
            disablePadding
            sx={{ '.MuiMenuItem-root.Mui-disabled': { opacity: 1 }, px: 3, py: 5 }}
          >
            <Content component={MenuItem} />
          </MenuList>
        </Menu>
      )}

      <WalletModal />
    </>
  );
}
