import { Trans } from '@lingui/macro';
import { Person } from '@mui/icons-material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import { Box, Button, Divider, ListItemIcon, ListItemText } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import makeBlockie from 'ethereum-blockies-base64';
import React, { useEffect, useState } from 'react';
import { Link } from 'src/components/Link';
import useGetEns from 'src/libs/hooks/use-get-ens';
import { useWeb3Context } from 'src/libs/web3-data-provider/Web3ContextProvider';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

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
            minWidth: 120,
          },
        }}
      >
        <MenuItem>{networkConfig.name}</MenuItem>
        <Divider />
        <MenuItem onClick={handleCopy}>
          <ListItemIcon>
            <ContentCopyRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy address</ListItemText>
        </MenuItem>
        <MenuItem
          component={Link}
          href={networkConfig.explorerLinkBuilder({ address: currentAccount })}
          onClick={handleClose}
          target="__BLANK"
        >
          <ListItemIcon>
            <OpenInNewRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View on Etherscan</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDisconnect}>
          <ListItemIcon>
            <RemoveCircleOutlineRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Disconnect Wallet</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSwitchNetwork}>
          <ListItemIcon>
            <RemoveCircleOutlineRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>SwitchNetwork</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
