import { Trans } from '@lingui/macro';
import { ContentCopy, Person } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { Box, Button, Divider, ListItemText, SvgIcon, Typography } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import makeBlockie from 'ethereum-blockies-base64';
import React, { useEffect, useState } from 'react';
import { Link } from 'src/components/Link';
import useGetEns from 'src/libs/hooks/use-get-ens';
import { useWeb3Context } from 'src/libs/web3-data-provider/Web3ContextProvider';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import DisconnectIcon from '/public/icons/disconnect.svg';

import { textCenterEllipsis } from '../helpers/text-center-ellipsis';

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
    <Trans>Connect Wallet</Trans>
  );

  return (
    <>
      <Button
        variant="surface"
        size="medium"
        aria-label="wallet"
        id="wallet-button"
        aria-controls={open ? 'wallet-button' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        sx={{ padding: '4px 12px 4px 8px' }}
        startIcon={
          connected ? (
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '1px solid #3E4365',
                img: { width: '100%', height: '100%', borderRadius: '50%' },
              }}
            >
              <img
                src={useBlockie ? makeBlockie(currentAccount) : ensAvatar}
                alt=""
                onError={() => setUseBlockie(true)}
              />
            </Box>
          ) : (
            <Person />
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
        <MenuItem onClick={handleCopy}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1px solid #3E4365',
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
              {ensNameAbbreviated && <Typography variant="main16">{ensNameAbbreviated}</Typography>}

              <Typography
                variant={ensNameAbbreviated ? 'secondary12' : 'main16'}
                color={ensNameAbbreviated ? 'primary.light' : 'primary.main'}
              >
                {textCenterEllipsis(currentAccount, ensNameAbbreviated ? 12 : 7, 4)}
              </Typography>
            </Box>

            <ContentCopy fontSize="small" sx={{ ml: 3 }} />
          </Box>
        </MenuItem>
        <Divider />

        <MenuItem onClick={handleSwitchNetwork}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography variant="secondary14" color="primary.light">
                <Trans>Network</Trans>
              </Typography>
              <Typography
                variant="buttonS"
                sx={{ borderRadius: '6px', border: '1px solid #E0E5EA', p: '0 6px' }}
              >
                <Trans>Switch</Trans>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  bgcolor: networkColor,
                  width: 7,
                  height: 7,
                  mr: 2,
                  border: '1px solid #E6E8F0',
                  borderRadius: '50%',
                }}
              />
              <Typography variant="main14">{networkConfig.name}</Typography>
            </Box>
          </Box>
        </MenuItem>
        <Divider />

        <MenuItem
          component={Link}
          href={networkConfig.explorerLinkBuilder({ address: currentAccount })}
          onClick={handleClose}
        >
          <ListItemText>
            <Trans>View on Etherscan</Trans>
          </ListItemText>
          <OpenInNewRoundedIcon fontSize="small" />
        </MenuItem>

        <MenuItem onClick={handleDisconnect}>
          <ListItemText>
            <Trans>Disconnect Wallet</Trans>
          </ListItemText>
          <SvgIcon fontSize="small">
            <DisconnectIcon />
          </SvgIcon>
        </MenuItem>
      </Menu>
    </>
  );
}
