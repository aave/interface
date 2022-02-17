import { StakingService } from '@aave/contract-helpers';
import { useContext } from 'react';
import { StakeTxBuilderContext } from 'src/providers/StakeTxBuilderProvider';

export const useStakeTxBuilderContext = (selectedToken: string): StakingService => {
  const context = useContext(StakeTxBuilderContext);

  return context.stakingServices[selectedToken];
};
