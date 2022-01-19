import { Person } from '@mui/icons-material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import { Button, Divider, ListItemIcon, ListItemText } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/system';
import makeBlockie from 'ethereum-blockies-base64';
import React, { useEffect, useState } from 'react';
import useGetEns from 'src/libs/hooks/use-get-ens';
import { useWeb3Context } from 'src/libs/web3-data-provider/Web3ContextProvider';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { ColorModeContext } from './MainLayout';

export default function WalletWidget() {
  const {
    connectWallet,
    disconnectWallet,
    currentAccount,
    connected,
    hasCachedProvider,
    networkId,
  } = useWeb3Context();

  const { name: ensName, avatar: ensAvatar } = useGetEns(currentAccount);
  const ensNameAbbreviated = ensName
    ? ensName.length > 18
      ? ensName // textCenterEllipsis(ensName, 12, 3) from ui kit (for reference)
      : ensName
    : undefined;

  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const [useBlockie, setUseBlockie] = useState(false);

  useEffect(() => {
    if (hasCachedProvider()) {
      connectWallet();
    }
  }, []);

  useEffect(() => {
    if (ensAvatar) {
      setUseBlockie(false);
    }
  }, [ensAvatar]);

  const open = Boolean(anchorEl);

  const networkConfig = getNetworkConfig(networkId);

  const handleClick = (event: { currentTarget: React.SetStateAction<null> }) => {
    if (!connected) {
      connectWallet();
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleDisconnect = () => {
    if (connected) {
      disconnectWallet();
      setAnchorEl(null);
    }
  };

  const handleCopy = async () => {
    navigator.clipboard.writeText(currentAccount);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEtherscanLink = () => {
    const explorerLink = `${networkConfig.explorerLink}/address/${currentAccount}`;
    console.log('explorer link: ', explorerLink);
    window.open(explorerLink, '_blank');
    setAnchorEl(null);
  };
  console.log('-------------', window.ethereum.request);
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
        onClick={handleClick}
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
        {currentAccount ? (
          <div>
            {
              ensNameAbbreviated
                ? ensNameAbbreviated
                : currentAccount /*textCenterEllipsis(currentAccount, 4, 4) left for reference*/
            }
          </div>
        ) : (
          'Connect Wallet'
        )}
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
        <MenuItem onClick={handleEtherscanLink}>
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
      </Menu>
    </div>
  );
}
