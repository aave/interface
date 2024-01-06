import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { Powers } from 'src/services/GovernanceService';
import { GovernanceTokensBalance } from 'src/services/WalletBalanceService';
const { BigNumber } = require('ethers');
import { ethers } from 'ethers';
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

  const convertToBigNumber = (value: typeof BigNumber, decimals = 18) =>
    value ? ethers.utils.parseUnits(value.toString(), decimals) : BigNumber.from(0);

  const aAavePower = convertToBigNumber(powers.aaveTokenPower.votingPower);
  const aAaveToken = convertToBigNumber(governanceTokens.aAave);
  const aavePower = convertToBigNumber(powers.aaveTokenPower.votingPower);
  const aaveToken = convertToBigNumber(governanceTokens.aave);
  const stkAavePower = convertToBigNumber(powers.stkAaveTokenPower.votingPower);
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
