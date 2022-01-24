import { Trans } from '@lingui/macro';
import { ContentCopy } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Box,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  SvgIcon,
  Typography,
} from '@mui/material';
import makeBlockie from 'ethereum-blockies-base64';
import { useEffect, useState } from 'react';
import useGetEns from 'src/libs/hooks/use-get-ens';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import DisconnectIcon from '/public/icons/disconnect.svg';
import LinkIcon from '/public/icons/link.svg';

import { Link } from '../components/Link';
import { textCenterEllipsis } from '../helpers/text-center-ellipsis';
import { getNetworkConfig } from '../utils/marketsAndNetworksConfig';

export default function WalletWidget() {
  const { connectWallet, disconnectWallet, currentAccount, connected, chainId, switchNetwork } =
    useWeb3Context();

  const { name: ensName, avatar: ensAvatar } = useGetEns(currentAccount);
  const ensNameAbbreviated = ensName
    ? ensName.length > 18
      ? textCenterEllipsis(ensName, 12, 3)
      : ensName
    : undefined;

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [useBlockie, setUseBlockie] = useState(false);

  useEffect(() => {
    if (ensAvatar) {
      setUseBlockie(false);
    }
  }, [ensAvatar]);

  const open = Boolean(anchorEl);

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
    setAnchorEl(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!connected) {
      connectWallet();
    } else {
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

  const handleSwitchNetwork = () => {
    switchNetwork(137);
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

  return (
    <>
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
                src={useBlockie ? makeBlockie(currentAccount) : ensAvatar}
                alt=""
                onError={() => setUseBlockie(true)}
              />
            </Box>
          )
        }
        endIcon={connected && <KeyboardArrowDownIcon />}
      >
        {buttonContent}
      </Button>

      <Menu
        id="wallet-menu"
        MenuListProps={{
          'aria-labelledby': 'wallet-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            minWidth: 240,
          },
        }}
      >
        <MenuList disablePadding>
          <MenuItem>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: '1px solid #FAFBFC1F',
                  mr: 3,
                  img: { width: '100%', height: '100%', borderRadius: '50%' },
                }}
              >
                <img
                  src={useBlockie ? makeBlockie(currentAccount) : ensAvatar}
                  alt=""
                  onError={() => setUseBlockie(true)}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {ensNameAbbreviated && <Typography variant="h4">{ensNameAbbreviated}</Typography>}

                <Typography
                  variant={ensNameAbbreviated ? 'caption' : 'h4'}
                  color={ensNameAbbreviated ? 'text.secondary' : 'text.primary'}
                >
                  {textCenterEllipsis(currentAccount, ensNameAbbreviated ? 12 : 7, 4)}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          <Divider />

          <MenuItem onClick={handleSwitchNetwork}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  <Trans>Network</Trans>
                </Typography>

                <Button size="small" variant="outlined">
                  <Trans>Switch</Trans>
                </Button>
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
                <Typography variant="subheader1">{networkConfig.name}</Typography>
              </Box>
            </Box>
          </MenuItem>
          <Divider />

          <MenuItem onClick={handleCopy}>
            <ListItemIcon>
              <ContentCopy fontSize="small" /> {/* TODO: need fix icon */}
            </ListItemIcon>
            <ListItemText>
              <Trans>Copy address</Trans>
            </ListItemText>
          </MenuItem>

          <MenuItem
            component={Link}
            href={networkConfig.explorerLinkBuilder({ address: currentAccount })}
            onClick={handleClose}
          >
            <ListItemIcon>
              <SvgIcon fontSize="small">
                <LinkIcon />
              </SvgIcon>
            </ListItemIcon>
            <ListItemText>
              <Trans>View on Etherscan</Trans>
            </ListItemText>
          </MenuItem>

          <MenuItem onClick={handleDisconnect}>
            <ListItemIcon>
              <SvgIcon fontSize="small">
                <DisconnectIcon />
              </SvgIcon>
            </ListItemIcon>
            <ListItemText>
              <Trans>Disconnect Wallet</Trans>
            </ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
}
