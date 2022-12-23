import { createContext, useContext, useState } from 'react';

interface HelpContextState {
  pagination: { SupplyTour: number; WithdrawTour: number };
  tourInProgress: string;
  totalPagination: { supplyPagination: number; withdrawPagination: number };
  clickAway: boolean;
  helpTourAsset: string;
  setClickAway: (clickAway: boolean) => void;
  setPagination: (pagination: number) => void;
  setTourInProgress: (tour: string) => void;
}
// set an empty object as default state
const HelpContext = createContext({} as HelpContextState);

export const HelpContextProvider: React.FC = ({ children }) => {
  const [pages, setPagination] = useState(1);
  const [clickAway, setClickAway] = useState(false);
  const [tourInProgress, setTourInProgress] = useState('');
  const helpTourAsset = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

  const totalPagination = { supplyPagination: 8, withdrawPagination: 12 };

  let pagination = {
    SupplyTour: 0,
    WithdrawTour: 0,
  };

  switch (tourInProgress) {
    case 'SupplyTour':
      pagination['SupplyTour'] = pages;
      break;
    case 'WithdrawTour':
      pagination['WithdrawTour'] = pages;
      break;
    default:
      pagination['SupplyTour'] = pages;
  }

  return (
    <HelpContext.Provider
      value={{
        pagination,
        totalPagination,
        tourInProgress,
        clickAway,
        helpTourAsset,
        setPagination,
        setTourInProgress,
        setClickAway,
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
