import React, { useState } from "react";
import { useTheme } from "@mui/system";
import { ColorModeContext } from "./MainLayout";
import { Button } from "@mui/material";

export default function WalletConnectWidget() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  const [isConnectorOpen, setConnectorOpen] = useState(false);

  return (
    <div>
      <Button
        
      >
        Connect Wallet
      </Button>
    </div>
  )
  
}