import { DuplicateIcon } from '@heroicons/react/outline';
import { ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
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
import { BadgeSize, ExclamationBadge } from 'src/components/badges/ExclamationBadge';
import { ConnectedUserAvatar } from 'src/components/ConnectedUserAvatar';
import { ConnectedUserNameText } from 'src/components/ConnectedUserName';
import { Warning } from 'src/components/primitives/Warning';
import { WalletModal } from 'src/components/WalletConnection/WalletModal';
import { useWalletModalContext } from 'src/hooks/useWalletModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

import { Link } from '../components/primitives/Link';
import { textCenterEllipsis } from '../helpers/text-center-ellipsis';
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

  const { setWalletModalOpen } = useWalletModalContext();

  const { breakpoints, palette } = useTheme();
  const xsm = useMediaQuery(breakpoints.down('xsm'));
  const md = useMediaQuery(breakpoints.down('md'));

  const defaultDomain = useRootStore((store) => store.defaultDomain);

  const ensName = defaultDomain?.name;

  const ensNameAbbreviated = ensName
    ? ensName.length > 18
      ? textCenterEllipsis(ensName, 12, 3)
      : ensName
    : undefined;

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
    if (!connected) {
      setWalletModalOpen(true);
    } else {
      setOpen(true);
      setAnchorEl(event.currentTarget);
    }
  };

  const handleDisconnect = () => {
    if (connected) {
      disconnectWallet();
      handleClose();
    }
  };

  const handleCopy = async () => {
    navigator.clipboard.writeText(currentAccount);
    handleClose();
  };

  const handleSwitchWallet = (): void => {
    setWalletModalOpen(true);
    handleClose();
  };

  const hideWalletAccountText = xsm && (ENABLE_TESTNET || STAGING_ENV || readOnlyModeAddress);

  const accountAvatar = (
    <ConnectedUserAvatar
      badge={<ExclamationBadge size={BadgeSize.SM} />}
      invisibleBadge={!readOnlyModeAddress}
      avatarProps={{ sx: { border: '1px solid #FAFBFC1F' }, size: AvatarSize.SM }}
    />
  );

  let buttonContent = <></>;
  if (currentAccount) {
    if (hideWalletAccountText) {
      buttonContent = <Box sx={{ margin: '1px 0' }}>{accountAvatar}</Box>;
    } else {
      buttonContent = <ConnectedUserNameText />;
    }
  } else {
    buttonContent = <Trans>Connect wallet</Trans>;
  }

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

      <Box component={component} disabled>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <ConnectedUserAvatar
              avatarProps={{ sx: { border: '1px solid #FAFBFC1F' }, size: AvatarSize.LG }}
              badge={
                <ExclamationBadge
                  size={BadgeSize.MD}
                  iconProps={{ sx: { background: md ? '#383D51' : palette.background.paper } }}
                />
              }
              invisibleBadge={!readOnlyModeAddress}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {ensNameAbbreviated && (
                <Typography variant="h4" color={{ xs: '#F1F1F3', md: 'text.primary' }}>
                  {ensNameAbbreviated}
                </Typography>
              )}
              <Typography
                variant={ensNameAbbreviated ? 'caption' : 'h4'}
                color={
                  ensNameAbbreviated
                    ? { xs: '#A5A8B6', md: 'text.secondary' }
                    : { xs: '#F1F1F3', md: 'text.primary' }
                }
              >
                {textCenterEllipsis(currentAccount, ensNameAbbreviated ? 12 : 7, 4)}
              </Typography>
            </Box>
          </Box>
          {readOnlyModeAddress && (
            <Warning
              icon={false}
              severity="warning"
              sx={{ mt: 3, mb: 0, ...(md ? { background: '#301E04', color: '#FFDCA8' } : {}) }}
            >
              <Trans>Read-only mode.</Trans>
            </Warning>
          )}
        </Box>
      </Box>
      {!md && (
        <Box sx={{ display: 'flex', flexDirection: 'row', padding: '0 16px 10px' }}>
          <Button
            variant="outlined"
            sx={{
              padding: '0 5px',
              marginRight: '10px',
            }}
            size="small"
            onClick={handleSwitchWallet}
          >
            Switch wallet
          </Button>
          <Button
            variant="outlined"
            sx={{
              padding: '0 5px',
            }}
            size="small"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </Box>
      )}
      <Divider sx={{ my: { xs: 7, md: 0 }, borderColor: { xs: '#FFFFFF1F', md: 'divider' } }} />

      <Box component={component} disabled>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
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
              {networkConfig.name}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ my: { xs: 7, md: 0 }, borderColor: { xs: '#FFFFFF1F', md: 'divider' } }} />

      <Box
        component={component}
        sx={{ color: { xs: '#F1F1F3', md: 'text.primary' } }}
        onClick={handleCopy}
      >
        <ListItemIcon
          sx={{
            color: {
              xs: '#F1F1F3',
              md: 'primary.light',
              minWidth: 'unset',
              marginRight: 12,
            },
          }}
        >
          <SvgIcon fontSize="small">
            <DuplicateIcon />
          </SvgIcon>
        </ListItemIcon>
        <ListItemText>
          <Trans>Copy address</Trans>
        </ListItemText>
      </Box>

      {networkConfig?.explorerLinkBuilder && (
        <Link href={networkConfig.explorerLinkBuilder({ address: currentAccount })}>
          <Box
            component={component}
            sx={{ color: { xs: '#F1F1F3', md: 'text.primary' } }}
            onClick={handleClose}
          >
            <ListItemIcon
              sx={{
                color: {
                  xs: '#F1F1F3',
                  md: 'primary.light',
                  minWidth: 'unset',
                  marginRight: 12,
                },
              }}
            >
              <SvgIcon fontSize="small">
                <ExternalLinkIcon />
              </SvgIcon>
            </ListItemIcon>
            <ListItemText>
              <Trans>View on Explorer</Trans>
            </ListItemText>
          </Box>
        </Link>
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
      {md && connected && open ? (
        <MobileCloseButton setOpen={setOpen} />
      ) : loading ? (
        <Skeleton height={36} width={126} sx={{ background: '#383D51' }} />
      ) : (
        <Button
          variant={connected ? 'surface' : 'gradient'}
          aria-label="wallet"
          id="wallet-button"
          aria-controls={open ? 'wallet-button' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleClick}
          sx={{
            p: connected ? '5px 8px' : undefined,
            minWidth: hideWalletAccountText ? 'unset' : undefined,
          }}
          startIcon={connected && accountAvatar}
          endIcon={
            connected &&
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
          {buttonContent}
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
          <MenuList disablePadding sx={{ '.MuiMenuItem-root.Mui-disabled': { opacity: 1 } }}>
            <Content component={MenuItem} />
          </MenuList>
        </Menu>
      )}

      <WalletModal />
    </>
  );
}
