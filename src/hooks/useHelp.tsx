import { createContext, useContext, useState } from 'react';

interface HelpContextState {
  pagination: { SupplyTour: number; WithdrawTour: number };
  tourInProgress: string;
  totalPagination: number | undefined;
  clickAway: boolean;
  helpTourAsset: string;
  withdrawTourActive: number;
  setClickAway: (clickAway: boolean) => void;
  setPagination: (pagination: number) => void;
  setTourInProgress: (tour: string) => void;
  setHelpTourAsset: (helpTourAsset: string) => void;
  setWitdrawTourActive: (withdrawTourActive: number) => void;
}
// set an empty object as default state
const HelpContext = createContext({} as HelpContextState);

export const HelpContextProvider: React.FC = ({ children }) => {
  const [pages, setPagination] = useState(1);
  const [withdrawTourActive, setWitdrawTourActive] = useState(1);
  const [clickAway, setClickAway] = useState(false);
  const [tourInProgress, setTourInProgress] = useState('Supply Tour');
  const [helpTourAsset, setHelpTourAsset] = useState('');

  const pagesInTour = { supplyPagination: 8, withdrawPagination: 7 };
  let pagination = {
    SupplyTour: 1,
    WithdrawTour: 1,
  };

  let totalPagination;

  switch (tourInProgress) {
    case 'Supply Tour':
      pagination['SupplyTour'] = pages;
      totalPagination = pagesInTour.supplyPagination;
      break;
    case 'Withdrawal Tour':
      pagination['WithdrawTour'] = pages;
      totalPagination = pagesInTour.withdrawPagination;
      break;
  }

  return (
    <HelpContext.Provider
      value={{
        pagination,
        totalPagination,
        tourInProgress,
        clickAway,
        helpTourAsset,
        withdrawTourActive,
        setPagination,
        setTourInProgress,
        setClickAway,
        setHelpTourAsset,
        setWitdrawTourActive,
      }}
    >
      {children}
    </HelpContext.Provider>
  );
};

export const useHelpContext = () => {
  const context = useContext(HelpContext);

  if (context === undefined) {
    throw new Error('useHelpContext must be used within a HelpProvider');
  }

  return context;
};
