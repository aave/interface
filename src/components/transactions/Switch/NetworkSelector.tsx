import { TextField } from "@mui/material";
import { BaseNetworkConfig } from "src/ui-config/networksConfig";

interface NetworkSelectorProps {
  networks: BaseNetworkConfig[];
  selectedNetwork: BaseNetworkConfig;
}

export const NetworkSelector = ({ networks }: NetworkSelectorProps) => {
  return (
    <TextField
      select
    >

    </TextField>
  );
}