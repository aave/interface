import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers/lib/ethers';
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

export const useGovernanceTokensAndPowers = (
  blockHash?: string
): GovernanceTokensAndPowers | undefined => {
  const { data: powers, refetch: refetchPowers } = usePowers(blockHash);
  const { data: governanceTokens } = useGovernanceTokens(blockHash);

  if (!powers || !governanceTokens) {
    return undefined;
  }

  // TODO Refactor and fix
  const convertToBigNumber = (value: string, decimals = 18) =>
    value ? ethers.utils.parseUnits(value.toString(), decimals) : BigNumber.from(0);

  const aAavePower = powers.aAaveTokenPower.votingPower;
  const aAaveToken = convertToBigNumber(governanceTokens.aAave);
  const aavePower = powers.aaveTokenPower.votingPower;
  const aaveToken = convertToBigNumber(governanceTokens.aave);
  const stkAavePower = powers.stkAaveTokenPower.votingPower;
  const stkAaveToken = convertToBigNumber(governanceTokens.stkAave);

  return {
    ...powers,
    ...governanceTokens,
    isAAaveTokenWithDelegatedPower: aAavePower.gt(aAaveToken),
    isAaveTokenWithDelegatedPower: aavePower.gt(aaveToken),
    isStkAaveTokenWithDelegatedPower: stkAavePower.gt(stkAaveToken),
    refetchPowers,
  };
};
