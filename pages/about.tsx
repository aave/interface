import * as React from "react";
import type { NextPage } from "next";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Link } from "../src/components/Link";
import ProTip from "../src/ProTip";
import Copyright from "../src/Copyright";
import { Trans } from "@lingui/macro";

const About: NextPage = () => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          <Trans>About the app</Trans>
        </Typography>
        <Box maxWidth="sm">
          <Button variant="contained" component={Link} noLinkStyle href="/">
            <Trans>Go to Home page</Trans>
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default About;
