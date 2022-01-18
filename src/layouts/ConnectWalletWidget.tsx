import React from "react";
import { Button, Divider, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Paper, Typography } from "@mui/material";
import { useWeb3Context } from "src/libs/web3-data-provider";
import { Cloud, ContentCopy, ContentCut, ContentPaste } from "@mui/icons-material";
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import { getNetworkConfig } from "src/helpers/config/markets-and-network-config";
import useGetEns from "src/libs/hooks/use-get-ens";

export default function ConnectWalletWidget() {
  const {connectWallet, disconnectWallet, currentAccount, connected, networkName, networkId} = useWeb3Context();

  const { name: ensName, avatar: ensAvatar } = useGetEns(currentAccount);
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const open = Boolean(anchorEl);
  
  const handleClick = (event: { currentTarget: React.SetStateAction<null>; }) => {
    if (!connected) {
      connectWallet();
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDisconnect = () => {
    if(connected) {
      disconnectWallet()
      setAnchorEl(null);
    }
  };

  const handleCopy = async () => {
    navigator.clipboard.writeText(currentAccount)
    setAnchorEl(null);
  };

  const handleEtherscanLink = () => {
    // link to etherscan in new window
    const networkConfig = getNetworkConfig(networkId);
    const explorerLink = `${networkConfig.explorerLink}/address/${currentAccount}`;
    console.log('explorer link: ', explorerLink)
    window.open(explorerLink, "_blank");
    setAnchorEl(null);
  };

  console.log('cionnected: ', connected)
  return (
    <div>
      <Button
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        {currentAccount? (<div>ensAvatar {ensName? ensName : currentAccount}</div>) : 'Connect Wallet'}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem>
          <p>Network </p>
          {networkName}
        </MenuItem>
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


    
  )
  
}