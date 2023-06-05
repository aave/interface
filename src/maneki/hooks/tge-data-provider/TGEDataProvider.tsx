import { BigNumber } from 'ethers';
import React from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';

interface TGEData {
  contributedBNB: BigNumber;
  setContributedBNB: (BNB: BigNumber) => void;
  BNBToContribute: string;
  setBNBToContribute: (BNB: string) => void;
  PAWToReceive: BigNumber;
  setPAWToReceive: (PAW: BigNumber) => void;
  PAWToReceiveEstimate: BigNumber;
  setPAWToReceiveEstimate: (PAW: BigNumber) => void;
  whitelistPhaseStart: string | null;
  setWhitelistPhaseStart: (date: string) => void;
  publicPhaseStart: string | null;
  setPublicPhaseStart: (date: string) => void;
  claimPhaseStart: string | null;
  setClaimPhaseStart: (date: string) => void;
  totalRaisedBNB: BigNumber;
  setTotalRaisedBNB: (BNB: BigNumber) => void;
  whitelistRaisedBNB: BigNumber;
  setWhitelistRaisedBNB: (BNB: BigNumber) => void;
  whitelistRaisedBNBAddr: string;
  setWhitelistRaisedBNBAddr: (addr: string) => void;
  finalPAWPrice: BigNumber;
  setFinalPAWPrice: (BNB: BigNumber) => void;
  marketCap: BigNumber;
  setMarketCap: (usd: BigNumber) => void;
  initialSupply: BigNumber;
  setInitialSupply: (supply: BigNumber) => void;
  totalSupply: BigNumber;
  setTotalSupply: (supply: BigNumber) => void;
}

export const TGEDataProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const [contributedBNB, setContributedBNB] = React.useState<BigNumber>(BigNumber.from(-1));
  const [BNBToContribute, setBNBToContribute] = React.useState<string>('');
  const [PAWToReceive, setPAWToReceive] = React.useState<BigNumber>(BigNumber.from(-1));
  const [PAWToReceiveEstimate, setPAWToReceiveEstimate] = React.useState<BigNumber>(
    BigNumber.from(-1)
  );
  const [whitelistPhaseStart, setWhitelistPhaseStart] = React.useState<string>('');
  const [publicPhaseStart, setPublicPhaseStart] = React.useState<string>('');
  const [claimPhaseStart, setClaimPhaseStart] = React.useState<string>('');
  const [whitelistRaisedBNBAddr, setWhitelistRaisedBNBAddr] = React.useState<string>('');
  const [whitelistRaisedBNB, setTotalRaisedBNB] = React.useState<BigNumber>(BigNumber.from(-1));
  const [totalRaisedBNB, setWhitelistRaisedBNB] = React.useState<BigNumber>(BigNumber.from(-1));
  const [finalPAWPrice, setFinalPAWPrice] = React.useState<BigNumber>(BigNumber.from(-1));
  const [marketCap, setMarketCap] = React.useState<BigNumber>(BigNumber.from(-1));
  const [initialSupply, setInitialSupply] = React.useState<BigNumber>(BigNumber.from(-1));
  const [totalSupply, setTotalSupply] = React.useState<BigNumber>(BigNumber.from(-1));

  return (
    <TGEContext.Provider
      value={{
        contributedBNB,
        setContributedBNB,
        BNBToContribute,
        setBNBToContribute,
        PAWToReceive,
        setPAWToReceive,
        PAWToReceiveEstimate,
        setPAWToReceiveEstimate,
        whitelistPhaseStart,
        setWhitelistPhaseStart,
        publicPhaseStart,
        setPublicPhaseStart,
        claimPhaseStart,
        setClaimPhaseStart,
        whitelistRaisedBNBAddr,
        setWhitelistRaisedBNB,
        whitelistRaisedBNB,
        setTotalRaisedBNB,
        totalRaisedBNB,
        setWhitelistRaisedBNBAddr,
        finalPAWPrice,
        setFinalPAWPrice,
        marketCap,
        setMarketCap,
        initialSupply,
        setInitialSupply,
        totalSupply,
        setTotalSupply,
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
