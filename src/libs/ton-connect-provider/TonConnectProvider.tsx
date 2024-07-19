import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { ExtendedFormattedUser } from 'src/hooks/pool/useExtendedUserSummaryAndIncentives';
import { TonConnectContext } from 'src/libs/hooks/useTonConnectContext';

export type TonConnectData = {
  isConnectedTonWallet: boolean;
  walletAddressTonWallet: string;
  disconnectTonWallet: () => void;
  connectTonWallet: () => void;
  loadingTonWallet: boolean;
  deactivatedTonWallet: boolean;
  userSummaryTon: ExtendedFormattedUser | undefined;
};

export const TonConnectContextProvider: React.FC<{
  children: ReactElement;
}> = ({ children }) => {
  const [isConnectedTonWallet, setIsConnectedTonWallet] = useState<boolean>(false);
  const [walletAddressTonWallet, setWalletAddressTonWallet] = useState<string>('');
  const [loadingTonWallet, setLoadingTonWallet] = useState<boolean>(false);
  const [deactivatedTonWallet, setDeactivatedTonWallet] = useState<boolean>(false);
  const wallet = useTonWallet();
  const userFriendlyAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const userSummaryTon = {
    userReservesData: [],
    totalLiquidityMarketReferenceCurrency: '0',
    totalLiquidityUSD: '0',
    totalCollateralMarketReferenceCurrency: '0',
    totalCollateralUSD: '0',
    totalBorrowsMarketReferenceCurrency: '0',
    totalBorrowsUSD: '0',
    netWorthUSD: '0',
    availableBorrowsMarketReferenceCurrency: '0',
    availableBorrowsUSD: '0',
    currentLoanToValue: '0',
    currentLiquidationThreshold: '0',
    healthFactor: '-1',
    isInIsolationMode: false,
    calculatedUserIncentives: {},
    userEmodeCategoryId: 0,
    isInEmode: false,
    earnedAPY: 0,
    debtAPY: 0,
    netAPY: 0,
  };

  useEffect(() => {
    if (wallet) {
      setIsConnectedTonWallet(true);
      setWalletAddressTonWallet(userFriendlyAddress);
    } else {
      setIsConnectedTonWallet(false);
      setWalletAddressTonWallet('');
    }
  }, [wallet, userFriendlyAddress]);

  const disconnectTonWallet = useCallback(async () => {
    setLoadingTonWallet(true);
    if (tonConnectUI) {
      tonConnectUI.disconnect();
      setLoadingTonWallet(false);
      setDeactivatedTonWallet(true);
      setIsConnectedTonWallet(false);
      setWalletAddressTonWallet('');
    }
  }, [tonConnectUI]);

  const connectTonWallet = useCallback(async () => {
    if (tonConnectUI) {
      tonConnectUI.openModal();
    }
  }, [tonConnectUI]);

  return (
    <TonConnectContext.Provider
      value={{
        tonConnectProviderData: {
          isConnectedTonWallet,
          walletAddressTonWallet,
          disconnectTonWallet,
          connectTonWallet,
          loadingTonWallet,
          deactivatedTonWallet,
          userSummaryTon,
        },
      }}
    >
      {children}
    </TonConnectContext.Provider>
  );
};
