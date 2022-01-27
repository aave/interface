import React from 'react';

export enum GasOption {
  Slow = 'slow',
  Normal = 'normal',
  Fast = 'fast',
  Custom = 'custom',
  Default = '-',
}

type Action =
  | { type: 'setGasOption'; value: GasOption }
  | { type: 'setCustomGasOption'; value: number };

type Dispatch = (action: Action) => void;

type State = { gasOption: GasOption; customGas: number };

const GasStationContext = React.createContext<{ state: State; dispatch: Dispatch } | undefined>(
  undefined
);

function gasStationReducer(state: State, action: Action) {
  switch (action.type) {
    case 'setGasOption': {
      return { gasOption: action.value, customGas: state.customGas };
    }
    case 'setCustomGasOption': {
      return { gasOption: GasOption.Custom, customGas: action.value };
    }
  }
}

const GasStationProvider: React.FC = ({ children }) => {
  const [state, dispatch] = React.useReducer(gasStationReducer, {
    gasOption: GasOption.Fast,
    customGas: 100,
  });

  const value = { state, dispatch };
  return <GasStationContext.Provider value={value}>{children}</GasStationContext.Provider>;
};

function useGasStation() {
  const context = React.useContext(GasStationContext);
  if (context === undefined) {
    throw new Error('useGasStation must be used within a GasStationProvider');
  }
  return context;
}

export { GasStationProvider, useGasStation };
