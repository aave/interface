import * as React from "react";
import type { NextPage } from "next";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Link } from "../src/components/Link";
import ProTip from "../src/ProTip";
import Copyright from "../src/Copyright";
import { Trans } from "@lingui/macro";

const Home: NextPage = () => {
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
          <Trans>Welcome to Aave UI</Trans>
        </Typography>
        <Link href="/about" color="secondary">
          <Trans>Go to About page</Trans>
        </Link>
      </Box>
    </Container>
  );
};

export default Home;
