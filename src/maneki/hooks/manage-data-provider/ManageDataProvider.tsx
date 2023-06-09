import { BigNumber } from 'ethers';
import React from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';

interface ManageData {
  stakedPAW: BigNumber;
  setStakedPAW: (stakedPAW: BigNumber) => void;
  lockedPAW: BigNumber;
  setLockedPAW: (PAW: BigNumber) => void;
  vestedPAW: BigNumber;
  setVestedPAW: (PAW: BigNumber) => void;
  lockedStakedValue: BigNumber;
  setLockedStakedValue: (PAW: BigNumber) => void;
  balancePAW: BigNumber;
  setBalancePAW: (PAW: BigNumber) => void;
  share: number;
  setShare: (PAW: number) => void;
  dailyRevenue: number;
  setDailyRevenue: (PAW: number) => void;
  topPanelLoading: boolean;
  setTopPanelLoading: (load: boolean) => void;
  mainActionsLoading: boolean;
  setMainActionsLoading: (load: boolean) => void;
  quickActionsLoading: boolean;
  setQuickActionsLoading: (load: boolean) => void;
}

export const ManageDataProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const [stakedPAW, setStakedPAW] = React.useState<BigNumber>(BigNumber.from(-1));
  const [lockedPAW, setLockedPAW] = React.useState<BigNumber>(BigNumber.from(-1));
  const [vestedPAW, setVestedPAW] = React.useState<BigNumber>(BigNumber.from(-1));
  const [lockedStakedValue, setLockedStakedValue] = React.useState<BigNumber>(BigNumber.from(-1));
  const [balancePAW, setBalancePAW] = React.useState<BigNumber>(BigNumber.from(-1));
  const [share, setShare] = React.useState<number>(-1);
  const [dailyRevenue, setDailyRevenue] = React.useState<number>(-1);
  const [topPanelLoading, setTopPanelLoading] = React.useState<boolean>(true);
  const [mainActionsLoading, setMainActionsLoading] = React.useState<boolean>(true);
  const [quickActionsLoading, setQuickActionsLoading] = React.useState<boolean>(true);

  return (
    <ManageContext.Provider
      value={{
        stakedPAW,
        setStakedPAW,
        lockedPAW,
        setLockedPAW,
        vestedPAW,
        setVestedPAW,
        lockedStakedValue,
        setLockedStakedValue,
        balancePAW,
        setBalancePAW,
        share,
        setShare,
        dailyRevenue,
        setDailyRevenue,
        topPanelLoading,
        setTopPanelLoading,
        mainActionsLoading,
        setMainActionsLoading,
        quickActionsLoading,
        setQuickActionsLoading,
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
