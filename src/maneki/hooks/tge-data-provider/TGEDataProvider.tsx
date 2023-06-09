import { BigNumber } from 'ethers';
import React from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';

export type TGEStatusType = 'Coming Soon' | 'Active' | 'Ended' | 'Inactive';

interface TGEData {
  userBalanceBNB: BigNumber;
  setUserBalanceBNB: (BNB: BigNumber) => void;
  contributedBNB: BigNumber;
  setContributedBNB: (BNB: BigNumber) => void;
  BNBToContribute: string;
  setBNBToContribute: (BNB: string) => void;
  PAWToReceive: BigNumber;
  setPAWToReceive: (PAW: BigNumber) => void;
  saleStartDate: number;
  setSaleStartDate: (date: number) => void;
  saleEndDate: number;
  setSaleEndDate: (date: number) => void;
  totalRaisedBNB: BigNumber;
  setTotalRaisedBNB: (BNB: BigNumber) => void;
  finalPAWPrice: BigNumber;
  setFinalPAWPrice: (BNB: BigNumber) => void;
  marketCap: BigNumber;
  setMarketCap: (usd: BigNumber) => void;
  initialSupply: BigNumber;
  setInitialSupply: (supply: BigNumber) => void;
  totalSupply: BigNumber;
  setTotalSupply: (supply: BigNumber) => void;
  TGEStatus: TGEStatusType;
  setTGEStatus: (status: TGEStatusType) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const TGEDataProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const [userBalanceBNB, setUserBalanceBNB] = React.useState<BigNumber>(BigNumber.from(-1));
  const [contributedBNB, setContributedBNB] = React.useState<BigNumber>(BigNumber.from(-1));
  const [BNBToContribute, setBNBToContribute] = React.useState<string>('');
  const [PAWToReceive, setPAWToReceive] = React.useState<BigNumber>(BigNumber.from(-1));
  const [saleStartDate, setSaleStartDate] = React.useState<number>(0);
  const [saleEndDate, setSaleEndDate] = React.useState<number>(0);
  const [totalRaisedBNB, setTotalRaisedBNB] = React.useState<BigNumber>(BigNumber.from(-1));
  const [finalPAWPrice, setFinalPAWPrice] = React.useState<BigNumber>(BigNumber.from(-1));
  const [marketCap, setMarketCap] = React.useState<BigNumber>(BigNumber.from(-1));
  const [initialSupply, setInitialSupply] = React.useState<BigNumber>(BigNumber.from(-1));
  const [totalSupply, setTotalSupply] = React.useState<BigNumber>(BigNumber.from(-1));
  const [TGEStatus, setTGEStatus] = React.useState<TGEStatusType>('Inactive');
  const [loading, setLoading] = React.useState<boolean>(false);

  return (
    <TGEContext.Provider
      value={{
        userBalanceBNB,
        setUserBalanceBNB,
        contributedBNB,
        setContributedBNB,
        BNBToContribute,
        setBNBToContribute,
        PAWToReceive,
        setPAWToReceive,
        saleStartDate,
        setSaleStartDate,
        saleEndDate,
        setSaleEndDate,
        setTotalRaisedBNB,
        totalRaisedBNB,
        finalPAWPrice,
        setFinalPAWPrice,
        marketCap,
        setMarketCap,
        initialSupply,
        setInitialSupply,
        totalSupply,
        setTotalSupply,
        TGEStatus,
        setTGEStatus,
        loading,
        setLoading,
      }}
    >
      {children}
    </TGEContext.Provider>
  );
};

export const TGEContext = React.createContext({} as TGEData);

export const useTGEContext = () => {
  const TGEData = React.useContext(TGEContext);

  return TGEData;
};
