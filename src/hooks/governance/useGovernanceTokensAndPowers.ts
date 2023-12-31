import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { Powers } from 'src/services/GovernanceService';
import { GovernanceTokensBalance } from 'src/services/WalletBalanceService';

import { useGovernanceTokens } from './useGovernanceTokens';
import { usePowers } from './usePowers';

interface GovernanceTokensAndPowers extends Powers, GovernanceTokensBalance {
  isAaveTokenWithDelegatedPower: boolean;
  isStkAaveTokenWithDelegatedPower: boolean;
  isAAaveTokenWithDelegatedPower: boolean;
  refetchPowers: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Powers, unknown>>;
}

export const useGovernanceTokensAndPowers = (): GovernanceTokensAndPowers | undefined => {
  const { data: powers, refetch: refetchPowers } = usePowers();
  const { data: governanceTokens } = useGovernanceTokens();

  if (!powers || !governanceTokens) {
    return undefined;
  }

  return {
    ...powers,
    ...governanceTokens,
    isAAaveTokenWithDelegatedPower:
      powers?.aaveTokenPower.votingPower.gt(governanceTokens.aAave) || false,
    isAaveTokenWithDelegatedPower:
      powers?.aaveTokenPower.votingPower.gt(governanceTokens.aave) || false,
    isStkAaveTokenWithDelegatedPower:
      powers?.stkAaveTokenPower.votingPower.gt(governanceTokens.stkAave) || false,
    refetchPowers,
  };
};
