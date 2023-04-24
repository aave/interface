import React from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';

interface ManageData {
  stakedPAW: number;
  setStakedPAW: (stakedPAW: number) => void;
  lockedPAW: number;
  setLockedPAW: (PAW: number) => void;
  lockedStakedValue: number;
  setLockedStakedValue: (PAW: number) => void;
  balancePAW: string;
  setBalancePAW: (PAW: string) => void;
  share: number;
  setShare: (PAW: number) => void;
  dailyRevenue: number;
  setDailyRevenue: (PAW: number) => void;
}

export const ManageDataProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const [stakedPAW, setStakedPAW] = React.useState<number>(-1);
  const [lockedPAW, setLockedPAW] = React.useState<number>(-1);
  const [lockedStakedValue, setLockedStakedValue] = React.useState<number>(-1);
  const [balancePAW, setBalancePAW] = React.useState<string>('');
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
