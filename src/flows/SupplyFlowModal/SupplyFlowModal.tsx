import React, { useState } from 'react';

import { AaveModal } from '../../components/AaveModal/AaveModal';
import { AssetInput } from '../../components/AssetInput';
import { SupplyDetails, SupplyReward } from './SupplyDetails';

export interface SupplyFlowProps {
  onClose: () => void;
  open: boolean;
  supplyApy: string;
  supplyRewards: SupplyReward[];
  healthFactor: string;
  balance: string;
  tokenSymbol: string;
}

export const SupplyFlowModal: React.FC<SupplyFlowProps> = ({
  open,
  onClose,
  supplyApy,
  // supplyRewards,
  healthFactor,
  balance,
  tokenSymbol,
  children,
}) => {
  const [inputValue, setInputValue] = useState('');

  const onInputChange = (value: string): void => {
    setInputValue(value);
  };

  // Mockup data until logic is imported
  const usdValue = '0';
  return (
    <AaveModal open={open} onClose={onClose} title={'Supply'}>
      <AssetInput
        value={inputValue}
        onChange={onInputChange}
        usdValue={usdValue}
        balance={balance}
        symbol={tokenSymbol}
        sx={{ mb: '40px' }}
      />
      <SupplyDetails
        supplyApy={supplyApy}
        // supplyRewards={supplyRewards}
        healthFactor={healthFactor}
      />
      {children}
    </AaveModal>
  );
};

export default SupplyFlowModal;
