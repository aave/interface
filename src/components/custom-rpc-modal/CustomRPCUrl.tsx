import { List } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { NetworkInput } from 'src/components/custom-rpc-modal/NetworkInput';
import { networkConfigs } from 'src/ui-config/networksConfig';
import { CustomRPCNetwork } from 'src/utils/marketsAndNetworksConfig';

type Props = {
  networks: CustomRPCNetwork[];
  setNetworks: (networks: CustomRPCNetwork[]) => void;
};

export type FormattedNetwork = {
  chainId: number;
  name: string;
  icon: string;
  url: string;
};

export const CustomRPCUrl: React.FC<Props> = ({ networks, setNetworks }) => {
  const localStorage = global?.window?.localStorage;

  const showTestNets = localStorage.getItem('testnetsEnabled') === 'true' || false;
  const [formattedNetworks, setFormattedNetworks] = useState<FormattedNetwork[]>([]);
  const [formattedTestNetworks, setFormattedTestNetworks] = useState<FormattedNetwork[]>([]);

  useEffect(() => {
    const newFormattedNetworks: FormattedNetwork[] = [];
    const newFormattedTestNetworks: FormattedNetwork[] = [];

    for (const chainId in networkConfigs) {
      const { name, networkLogoPath, isTestnet } = networkConfigs[chainId];
      const currentNetwork = networks.find((network) => network.chainId === Number(chainId));
      if (!isTestnet) {
        newFormattedNetworks.push({
          chainId: Number(chainId),
          name: name,
          url: currentNetwork?.url || '',
          icon: networkLogoPath,
        });
      } else {
        newFormattedTestNetworks.push({
          chainId: Number(chainId),
          name: name,
          url: currentNetwork?.url || '',
          icon: networkLogoPath,
        });
      }
    }

    setFormattedNetworks(newFormattedNetworks);
    setFormattedTestNetworks(newFormattedTestNetworks);
  }, [, networks]);

  const handleInput = (chainId: number, newUrl: string) => {
    let newNetworks: CustomRPCNetwork[] = [];

    if (newUrl) {
      newNetworks = [
        ...networks.filter((network) => network.chainId !== chainId),
        { chainId, url: newUrl },
      ];
    } else {
      newNetworks = networks.filter((network) => network.chainId !== chainId);
    }

    setNetworks(newNetworks);
  };

  return (
    <>
      <List sx={{ maxHeight: '30vh', overflow: 'scroll' }}>
        {showTestNets
          ? formattedTestNetworks.map((network) => {
              return (
                <NetworkInput key={network.chainId} network={network} handleInput={handleInput} />
              );
            })
          : formattedNetworks.map((network) => {
              return (
                <NetworkInput key={network.chainId} network={network} handleInput={handleInput} />
              );
            })}
      </List>
    </>
  );
};
