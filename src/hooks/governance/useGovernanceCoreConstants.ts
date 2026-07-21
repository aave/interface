import { useQuery } from '@tanstack/react-query';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

/**
 * GovernanceCore immutables read on-chain (cooldownPeriod / expirationTime, in seconds, plus
 * precisionDivider / cancellationFee). They are emitted by no event, so the cache can't provide
 * them — but they never change, so we read once and cache forever.
 */
export const useGovernanceCoreConstants = () => {
  const { governanceV3Service } = useSharedDependencies();
  return useQuery({
    queryKey: ['governanceCoreConstants'],
    queryFn: () => governanceV3Service.getVotingConfig(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
