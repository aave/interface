import { BigNumber } from 'ethers';
import React from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';

interface LeverageData {
  collateralAmount: BigNumber;
  setCollateralAmount: (value: BigNumber) => void;
  collateralValue: BigNumber;
  setCollateralValue: (value: BigNumber) => void;
  collateralAsset: string;
  setCollateralAsset: (asset: string) => void;
  walletBalance: BigNumber;
  setWalletBalance: (value: BigNumber) => void;
  leverage: number;
  setLeverage: (value: number) => void;
  apr: BigNumber;
  setApr: (value: BigNumber) => void;
  borrowAmount: BigNumber[];
  setBorrowAmount: (value: BigNumber[]) => void;
}

export const LeverageDataProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const [collateralAmount, setCollateralAmount] = React.useState<BigNumber>(BigNumber.from(-1));
  const [collateralValue, setCollateralValue] = React.useState<BigNumber>(BigNumber.from(-1));
  const [collateralAsset, setCollateralAsset] = React.useState<string>('');
  const [walletBalance, setWalletBalance] = React.useState<BigNumber>(BigNumber.from(-1));
  const [leverage, setLeverage] = React.useState<number>(2);
  const [apr, setApr] = React.useState<BigNumber>(BigNumber.from(-1));
  const [borrowAmount, setBorrowAmount] = React.useState<BigNumber[]>([]);
  return (
    <LeverageContext.Provider
      value={{
        collateralAmount,
        setCollateralAmount,
        collateralValue,
        setCollateralValue,
        collateralAsset,
        setCollateralAsset,
        walletBalance,
        setWalletBalance,
        leverage,
        setLeverage,
        apr,
        setApr,
        borrowAmount,
        setBorrowAmount,
      }}
    >
      {children}
    </LeverageContext.Provider>
  );
};

export const LeverageContext = React.createContext({} as LeverageData);

export const useLeverageContext = () => {
  const LeverageData = React.useContext(LeverageContext);

  return LeverageData;
};
