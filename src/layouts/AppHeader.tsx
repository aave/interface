import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Button, Typography } from "@mui/material";
import AaveLogo from "@mui/icons-material/GolfCourseSharp";
import { Link } from "../components/Link";
import MoreMenu from "./MoreMenu";

const Header = styled("header")(({ theme }) => ({
  position: "sticky",
  top: 0,
  transition: theme.transitions.create("top"),
  zIndex: theme.zIndex.appBar,
  backdropFilter: "blur(20px)",
  boxShadow: `inset 0px -1px 1px ${
    theme.palette.mode === "dark"
      ? theme.palette.primaryDark[700]
      : theme.palette.grey[100]
  }`,
  backgroundColor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.primaryDark[900], 0.72)
      : "rgba(255,255,255,0.72)",
}));

export default function AppHeader() {
  return (
    <Header>
      <Container sx={{ display: "flex", alignItems: "center", minHeight: 64 }}>
        <Box
          component={Link}
          href={"/"}
          aria-label="Go to homepage"
          sx={{ lineHeight: 0, mr: 2, display: "flex" }}
        >
          <AaveLogo width={32} />
          <Typography>Aave</Typography>
        </Box>
        <Box sx={{ ml: "auto" }} />
        <Box sx={{ display: { xs: "none", sm: "initial" }, mr: "12px" }}>
          <Button variant="outlined">Blog</Button>
        </Box>
        <Box color="inherit">
          <MoreMenu />
        </Box>
      </Container>
    </Header>
  );
}
