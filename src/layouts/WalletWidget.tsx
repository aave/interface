import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Person,
} from "@mui/icons-material";
import { ColorModeContext } from "./MainLayout";
import { useTheme } from "@mui/system";
import { useWeb3Context } from "src/libs/web3-data-provider";
import useGetEns from "src/libs/hooks/use-get-ens";
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { getNetworkConfig } from "src/utils/marketsAndNetworksConfig";

export default function WalletWidget() {
  const {connectWallet, disconnectWallet, currentAccount, connected, networkName, networkId} = useWeb3Context();
  const { name: ensName, avatar: ensAvatar } = useGetEns(currentAccount);

  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: { currentTarget: React.SetStateAction<null>; }) => {
    if (!connected) {
      connectWallet();
    } else {
      setAnchorEl(event.currentTarget);
    }
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

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEtherscanLink = () => {
    const networkConfig = getNetworkConfig(networkId);
    const explorerLink = `${networkConfig.explorerLink}/address/${currentAccount}`;
    console.log('explorer link: ', explorerLink)
    window.open(explorerLink, "_blank");
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        variant="outlined"
        size="small"
        aria-label="more"
        id="wallet-button"
        aria-controls={open ? "more-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        color="inherit"
        startIcon={<Person />}
        endIcon={<ArrowDropDownIcon />}
      >
        {currentAccount? (<div>ensAvatar {ensName? ensName : currentAccount}</div>) : 'Connect Wallet'}
      </Button>
      <Menu
        id="more-menu"
        MenuListProps={{
          "aria-labelledby": "more-button",
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
  );
}
