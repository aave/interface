import { DuplicateIcon, LogoutIcon } from '@heroicons/react/outline';
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
} from '@mui/material';
import makeBlockie from 'ethereum-blockies-base64';
import stubTrue from 'lodash/stubTrue';
import React, { useEffect, useState } from 'react';
import { WalletModal } from 'src/components/WalletConnection/WalletModal';
import { useWalletModalContext } from 'src/hooks/useWalletModal';
import useGetEns from 'src/libs/hooks/use-get-ens';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { Link } from '../components/primitives/Link';
import { textCenterEllipsis } from '../helpers/text-center-ellipsis';
import { getNetworkConfig } from '../utils/marketsAndNetworksConfig';
import { DrawerWrapper } from './components/DrawerWrapper';
import { MobileCloseButton } from './components/MobileCloseButton';

interface WalletWidgetProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  headerHeight: number;
  md: boolean;
}

export default function WalletWidget({ open, setOpen, headerHeight, md }: WalletWidgetProps) {
  const { disconnectWallet, currentAccount, connected, chainId, loading } = useWeb3Context();

  const { setWalletModalOpen } = useWalletModalContext();

  const { name: ensName, avatar: ensAvatar } = useGetEns(currentAccount);
  const ensNameAbbreviated = ensName
    ? ensName.length > 18
      ? textCenterEllipsis(ensName, 12, 3)
      : ensName
    : undefined;

  const [useBlockie, setUseBlockie] = useState(false);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  useEffect(() => {
    if (ensAvatar) {
      setUseBlockie(false);
    }
  }, [ensAvatar]);

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
      setWalletModalOpen(stubTrue);
    } else {
      setOpen(true);
      setAnchorEl(event.currentTarget);
    }
  };

  const handleDisconnect = () => {
    if (connected) {
      disconnectWallet();
      handleClose();
      localStorage.removeItem('mockWalletAddress');
    }
  };

  const handleCopy = async () => {
    navigator.clipboard.writeText(currentAccount);
    handleClose();
  };

  const buttonContent = currentAccount ? (
    ensNameAbbreviated ? (
      ensNameAbbreviated
    ) : (
      textCenterEllipsis(currentAccount, 4, 4)
    )
  ) : (
    <Trans>Connect wallet</Trans>
  );

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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid #FAFBFC1F',
              mr: 3,
              img: { width: '100%', height: '100%', borderRadius: '50%' },
            }}
          >
            <img
              src={
                useBlockie
                  ? makeBlockie(currentAccount !== '' ? currentAccount : 'default')
                  : ensAvatar
              }
              alt=""
              onError={() => setUseBlockie(true)}
            />
          </Box>
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
      </Box>
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

      <Box
        component={component}
        sx={{ color: { xs: '#F1F1F3', md: 'text.primary' } }}
        onClick={handleDisconnect}
      >
        <ListItemIcon
          sx={{
            color: { xs: '#F1F1F3', md: 'primary.light', minWidth: 'unset', marginRight: 12 },
          }}
        >
          <SvgIcon fontSize="small">
            <LogoutIcon />
          </SvgIcon>
        </ListItemIcon>
        <ListItemText>
          <Trans>Disconnect Wallet</Trans>
        </ListItemText>
      </Box>
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
          sx={{ p: connected ? '5px 8px' : undefined }}
          startIcon={
            connected && (
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: '1px solid #FAFBFC1F',
                  img: { width: '100%', height: '100%', borderRadius: '50%' },
                }}
              >
                <img
                  src={
                    useBlockie
                      ? makeBlockie(currentAccount !== '' ? currentAccount : 'default')
                      : ensAvatar
                  }
                  alt=""
                  onError={() => setUseBlockie(true)}
                />
              </Box>
            )
          }
          endIcon={
            connected && (
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
