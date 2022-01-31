import React from 'react';
import { BasicModal, BasicModalProps } from './BasicModal';
import { GasStationProvider } from '../GasStation/GasStationProvider';

export const ActionModal = (props: BasicModalProps) => (
  <GasStationProvider>
    <BasicModal {...props} />
  </GasStationProvider>
);
