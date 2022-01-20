import { Person } from '@mui/icons-material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import { Button, Divider, ListItemIcon, ListItemText } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import makeBlockie from 'ethereum-blockies-base64';
import React, { useEffect, useState } from 'react';
import { Link } from 'src/components/Link';
import useGetEns from 'src/libs/hooks/use-get-ens';
import { useWeb3Context } from 'src/libs/web3-data-provider/Web3ContextProvider';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

export default function WalletWidget() {
  const { connectWallet, disconnectWallet, currentAccount, connected, chainId, switchNetwork } =
    useWeb3Context();

  const { name: ensName, avatar: ensAvatar } = useGetEns(currentAccount);
  const ensNameAbbreviated = ensName
    ? ensName.length > 18
      ? ensName // textCenterEllipsis(ensName, 12, 3) from ui kit (for reference)
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

  return (
    <div>
      <Button
        variant="outlined"
        size="small"
        aria-label="more"
        id="wallet-button"
        aria-controls={open ? 'more-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={(event) => handleClick(event)}
        color="inherit"
        startIcon={
          connected ? (
            <img
              style={{ width: '15px', height: '15px' }}
              src={useBlockie ? makeBlockie(currentAccount) : ensAvatar}
              alt=""
              onError={() => setUseBlockie(true)}
            />
          ) : (
            <Person />
          )
        }
        endIcon={<ArrowDropDownIcon />}
      >
        {currentAccount
          ? ensNameAbbreviated
            ? ensNameAbbreviated
            : currentAccount /*textCenterEllipsis(currentAccount, 4, 4) left for reference*/
          : 'Connect Wallet'}
      </Button>
      <Menu
        id="more-menu"
        MenuListProps={{
          'aria-labelledby': 'more-button',
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
    </div>
  );
}
