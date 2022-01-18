import React from "react";
import { Button } from "@mui/material";
import { useWeb3Context } from "src/libs/web3-data-provider";

export default function ConnectWalletWidget() {
  const {connectWallet, disconnectWallet} = useWeb3Context();
  
  return (
    <div>
      <Button
        onClick={connectWallet}
      >
        Connect Wallet
      </Button>
      <Button onClick={disconnectWallet}>
        Disconnect
      </Button>
    </div>
  )
  
}