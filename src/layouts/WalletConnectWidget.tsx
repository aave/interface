import React, { useState } from "react";
import { useTheme } from "@mui/system";
import { ColorModeContext } from "./MainLayout";
import { Button } from "@mui/material";
import ConnectWalletModal from "../components/ConnectWalletModal";
import { useUserWalletDataContext } from "../libs/web3-data-provider";

export default function WalletConnectWidget() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const {handleUnlockWallet} = useUserWalletDataContext();
  const [isConnectorOpen, setConnectorOpen] = useState(false);

  return (
    <div>
      <ConnectWalletModal 
        preferredChainId={1}
        supportedChainIds={[1]}
        onBackdropPress={() => setConnectorOpen(false)}
        isVisible={isConnectorOpen}
        onUnlockExternalWallet={handleUnlockWallet}
      />
      <Button
        onClick={() => setConnectorOpen(!isConnectorOpen)}
      >
        Connect Wallet
      </Button>
    </div>
  )
  
}