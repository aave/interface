import { BigNumber } from 'ethers';
import React from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';

interface ManageData {
  stakedPAW: BigNumber;
  setStakedPAW: (stakedPAW: BigNumber) => void;
  lockedPAW: BigNumber;
  setLockedPAW: (PAW: BigNumber) => void;
  lockedStakedValue: BigNumber;
  setLockedStakedValue: (PAW: BigNumber) => void;
  balancePAW: BigNumber;
  setBalancePAW: (PAW: BigNumber) => void;
  share: number;
  setShare: (PAW: number) => void;
  dailyRevenue: number;
  setDailyRevenue: (PAW: number) => void;
}

export const ManageDataProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const [stakedPAW, setStakedPAW] = React.useState<BigNumber>(BigNumber.from(-1));
  const [lockedPAW, setLockedPAW] = React.useState<BigNumber>(BigNumber.from(-1));
  const [lockedStakedValue, setLockedStakedValue] = React.useState<BigNumber>(BigNumber.from(-1));
  const [balancePAW, setBalancePAW] = React.useState<BigNumber>(BigNumber.from(-1));
  const [share, setShare] = React.useState<number>(-1);
  const [dailyRevenue, setDailyRevenue] = React.useState<number>(-1);

  return (
    <ManageContext.Provider
      value={{
        stakedPAW,
        setStakedPAW,
        lockedPAW,
        setLockedPAW,
        lockedStakedValue,
        setLockedStakedValue,
        balancePAW,
        setBalancePAW,
        share,
        setShare,
        dailyRevenue,
        setDailyRevenue,
      }}
    >
      {children}
    </ManageContext.Provider>
  );
};

export const ManageContext = React.createContext({} as ManageData);

export const useManageContext = () => {
  const ManageData = React.useContext(ManageContext);

  return ManageData;
};
