import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuList,
} from "@mui/material";
import {
  GitHub,
  LibraryBooks,
  Person,
  QuestionMarkOutlined,
} from "@mui/icons-material";
import { ColorModeContext } from "./MainLayout";
import { useTheme } from "@mui/system";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function WalletWidget() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
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
        Jouni.eth
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
        <MenuList>
          <MenuItem>
            <ListItemIcon>
              <QuestionMarkOutlined fontSize="small" />
            </ListItemIcon>
            <ListItemText>FAQ</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <LibraryBooks fontSize="small" />
            </ListItemIcon>
            <ListItemText>Developers</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem>
            <ListItemIcon>
              <QuestionMarkOutlined fontSize="small" />
            </ListItemIcon>
            <ListItemText>Discord</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <GitHub fontSize="small" />
            </ListItemIcon>
            <ListItemText>Github</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={colorMode.toggleColorMode}>
            <ListItemIcon>
              {theme.palette.mode === "dark" ? (
                <Brightness7Icon />
              ) : (
                <Brightness4Icon />
              )}
            </ListItemIcon>
            <ListItemText>
              Switch to {theme.palette.mode === "dark" ? "light" : "dark"} mode
            </ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
    </div>
  );
}
