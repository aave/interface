import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Button } from "@mui/material";

const options = [
  {
    title: "Dashboard",
    link: "/dashboard",
  },
  {
    title: "Markets",
    link: "/markets",
  },
  {
    title: "Stake",
    link: "/stake",
  },
  {
    title: "Governance",
    link: "/governance",
  },
];

export default function MoreMenu() {
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
        id="more-button"
        aria-controls={open ? "more-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        sx={{ px: 0.5, width: "36px", minWidth: 0 }}
        color="inherit"
      >
        <MoreHorizIcon />
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
        {options.map((option) => (
          <MenuItem key={option.title} onClick={handleClose}>
            {option.title}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
