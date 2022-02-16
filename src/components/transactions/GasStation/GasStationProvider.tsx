import React from 'react';

import useGetGasPrices, { GetGasPricesHook } from '../../../hooks/useGetGasPrices';

export enum GasOption {
  Slow = 'slow',
  Normal = 'normal',
  Fast = 'fast',
  Custom = 'custom',
}

type Action =
  | { type: 'setGasOption'; value: GasOption }
  | { type: 'setCustomGasOption'; value: string };

type Dispatch = (action: Action) => void;

type State = { gasOption: GasOption; customGas: string };

export const GasStationContext = React.createContext<
  { state: State; dispatch: Dispatch; gasPriceData: GetGasPricesHook } | undefined
>(undefined);

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

export const GasStationProvider: React.FC = ({ children }) => {
  const [state, dispatch] = React.useReducer(gasStationReducer, {
    gasOption: GasOption.Normal,
    customGas: '100',
  });
  const gasPriceData = useGetGasPrices();

  const value = { state, dispatch, gasPriceData };
  return <GasStationContext.Provider value={value}>{children}</GasStationContext.Provider>;
};
