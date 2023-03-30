import React from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';

interface ManageData {
  stakedPAW: number;
  setStakedPAW: (stakedPAW: number) => void;
  lockedPAW: number;
  setLockedPAW: (stakedPAW: number) => void;
  balancePAW: number;
  setBalancePAW: (stakedPAW: number) => void;
  share: number;
  setShare: (stakedPAW: number) => void;
  dailyRevenue: number;
  setDailyRevenue: (stakedPAW: number) => void;
}

export const ManageDataProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const [stakedPAW, setStakedPAW] = React.useState<number>(-1);
  const [lockedPAW, setLockedPAW] = React.useState<number>(-1);
  const [balancePAW, setBalancePAW] = React.useState<number>(-1);
  const [share, setShare] = React.useState<number>(-1);
  const [dailyRevenue, setDailyRevenue] = React.useState<number>(-1);

  return (
    <ManageContext.Provider
      value={{
        stakedPAW,
        setStakedPAW,
        lockedPAW,
        setLockedPAW,
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
