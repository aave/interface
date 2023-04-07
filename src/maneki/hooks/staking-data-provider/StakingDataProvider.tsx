import React from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';

interface StakingData {
  stakedPAW: number;
  setStakedPAW: (stakedPAW: number) => void;
  share: number;
  setShare: (stakedPAW: number) => void;
  dailyRevenue: number;
  setDailyRevenue: (stakedPAW: number) => void;
}

export const StakingDataProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const [stakedPAW, setStakedPAW] = React.useState<number>(-1);
  const [share, setShare] = React.useState<number>(-1);
  const [dailyRevenue, setDailyRevenue] = React.useState<number>(-1);

  return (
    <StakingContext.Provider
      value={{
        stakedPAW,
        setStakedPAW,
        share,
        setShare,
        dailyRevenue,
        setDailyRevenue,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
};

export const StakingContext = React.createContext({} as StakingData);

export const useStakingContext = () => {
  const StakingData = React.useContext(StakingContext);

  return StakingData;
};
