// import { BaseNetworkConfig } from "../ui-config/networksConfig";

import React, { PropsWithChildren, useContext, useState } from 'react';

export interface MockWalletAddressContextData {
  mockWalletAddress: string;
  setMockWalletAddress: (mockWalletAddress: string) => void;
}

const MockWalletAddressContext = React.createContext({} as MockWalletAddressContextData);

// eslint-disable-next-line @typescript-eslint/ban-types
export function MockWalletAddressProvider({ children }: PropsWithChildren<{}>) {
  const [mockWalletAddress, setMockWalletAddress] = useState<string>('');

  const handleSetMockWalletAddress = (mockWalletAddress: string) => {
    setMockWalletAddress(mockWalletAddress);
  };

  return (
    <MockWalletAddressContext.Provider
      value={{
        mockWalletAddress,
        setMockWalletAddress: handleSetMockWalletAddress,
      }}
    >
      {children}
    </MockWalletAddressContext.Provider>
  );
}

export const useMockWalletAddressContext = () => useContext(MockWalletAddressContext);
