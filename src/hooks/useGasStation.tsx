import React from 'react';
import { GasStationContext } from 'src/components/transactions/GasStation/GasStationProvider';

export function useGasStation() {
  const context = React.useContext(GasStationContext);

  if (context === undefined) {
    throw new Error('useGasStation must be used within a GasStationProvider');
  }
  return context;
}
