import {
  AaveGovernanceService,
  GovernancePowerDelegationTokenService,
  tEthereumAddress,
} from '@aave/contract-helpers';
import { normalize, valueToBigNumber } from '@aave/math-utils';
import { useApolloClient } from '@apollo/client';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { GovernanceConfig } from 'src/ui-config/governanceConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import { usePolling } from '../usePolling';
import { useProtocolDataContext } from '../useProtocolDataContext';
import { PowerQuery, PowerQueryResponseType } from './useVotingPower';

const checkIfDelegateeIsUser = (delegatee: tEthereumAddress, userAddress: tEthereumAddress) =>
  delegatee.toLocaleLowerCase() === userAddress.toLocaleLowerCase() ? '' : delegatee;

interface UseGovernanceDataProps {
  governanceConfig: GovernanceConfig;
}

export function _useGovernanceDataRPC({ governanceConfig }: UseGovernanceDataProps) {
  const { cache } = useApolloClient();
  const { currentAccount } = useWeb3Context();
  const { currentNetworkConfig, jsonRpcProvider } = useProtocolDataContext();

  const isGovernanceFork =
    currentNetworkConfig.isFork &&
    currentNetworkConfig.underlyingChainId === governanceConfig?.chainId;
  const rpcProvider = isGovernanceFork ? jsonRpcProvider : getProvider(governanceConfig.chainId);
  const { aaveTokenAddress, stkAaveTokenAddress } = governanceConfig;

  const governanceService = new AaveGovernanceService(rpcProvider, {
    GOVERNANCE_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2,
    GOVERNANCE_HELPER_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2_HELPER,
    ipfsGateway: governanceConfig.ipfsGateway,
  });

  const governanceDelegationService = new GovernancePowerDelegationTokenService(rpcProvider);

  async function getPowers() {
    try {
      const [aaveTokenPower, stkAaveTokenPower] = await governanceService.getTokensPower({
        user: currentAccount,
        tokens: [aaveTokenAddress, stkAaveTokenAddress],
      });
      const powers = {
        votingPower: normalize(
          valueToBigNumber(aaveTokenPower.votingPower.toString())
            .plus(stkAaveTokenPower.votingPower.toString())
            .toString(),
          18
        ),
        aaveTokenPower,
        stkAaveTokenPower,
        propositionPower: normalize(
          valueToBigNumber(aaveTokenPower.propositionPower.toString())
            .plus(stkAaveTokenPower.propositionPower.toString())
            .toString(),
          18
        ),
        aaveVotingDelegatee: checkIfDelegateeIsUser(
          aaveTokenPower.delegatedAddressVotingPower,
          currentAccount
        ),
        aavePropositionDelegatee: checkIfDelegateeIsUser(
          aaveTokenPower.delegatedAddressPropositionPower,
          currentAccount
        ),
        stkAaveVotingDelegatee: checkIfDelegateeIsUser(
          stkAaveTokenPower.delegatedAddressVotingPower,
          currentAccount
        ),
        stkAavePropositionDelegatee: checkIfDelegateeIsUser(
          stkAaveTokenPower.delegatedAddressPropositionPower,
          currentAccount
        ),
      };
      cache.writeQuery<PowerQueryResponseType>({
        query: PowerQuery,
        variables: { userAccount: currentAccount },
        data: {
          __typename: 'Query',
          votingPowers: {
            __typename: 'VotingPowers',
            ...powers,
          },
        },
      });
    } catch (e) {
      console.log('error fetching powers', e);
    }
  }

  usePolling(getPowers, 60000, !currentAccount || !governanceConfig || !governanceService, [
    currentAccount,
    isGovernanceFork,
  ]);

  return { governanceService, governanceDelegationService };
}
