import { ConnectKitButton, ConnectKitProvider, getDefaultConfig } from 'connectkit';
import React, { ReactElement } from 'react';
import { createConfig, WagmiConfig } from 'wagmi';

const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    // alchemyId: process.env.ALCHEMY_ID, // or infuraId
    walletConnectProjectId: '5e8e618c68a73b7fb035c833dbf210b4', // process.env.WALLETCONNECT_PROJECT_ID,

    // Required
    appName: 'Your App Name',

    // Optional
    appDescription: 'Your App Description',
    appUrl: 'https://family.co', // your app's url
    appIcon: 'https://family.co/logo.png', // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

export const Web3ContextProviderConnectKit: React.FC<{ children: ReactElement }> = ({
  children,
}) => {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        {children}
        <ConnectKitButton />
      </ConnectKitProvider>
    </WagmiConfig>
  );
};
