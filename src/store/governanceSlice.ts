import {
  AaveGovernanceService,
  GovernancePowerDelegationTokenService,
  Power,
  tEthereumAddress,
} from '@aave/contract-helpers';
import { StateCreator } from 'zustand';
import { RootStore } from './root';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { normalize, valueToBigNumber } from '@aave/math-utils';

export interface GovernanceSlice {
  powers?: {
    votingPower: string;
    propositionPower: string;
    aaveVotingDelegatee: string;
    aavePropositionDelegatee: string;
    stkAaveVotingDelegatee: string;
    stkAavePropositionDelegatee: string;
    aaveTokenPower: Power;
    stkAaveTokenPower: Power;
  };
  refreshGovernanceData: () => Promise<void>;
}

const checkIfDelegateeIsUser = (delegatee: tEthereumAddress, userAddress: tEthereumAddress) =>
  delegatee.toLocaleLowerCase() === userAddress.toLocaleLowerCase() ? '' : delegatee;

export const createGovernanceSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  GovernanceSlice
> = (set, get) => ({
  getGovernanceDelegationService: () => {
    const currentNetworkConfig = get().currentNetworkConfig;
    console.log('triggered');
    const isStakeFork =
      currentNetworkConfig.isFork &&
      currentNetworkConfig.underlyingChainId === governanceConfig?.chainId;
    const rpcProvider = isStakeFork
      ? get().jsonRpcProvider()
      : getProvider(governanceConfig.chainId);
    return new GovernancePowerDelegationTokenService(rpcProvider);
  },
  refreshGovernanceData: async () => {
    const account = get().account;
    if (!account) return;
    const currentNetworkConfig = get().currentNetworkConfig;
    const isStakeFork =
      currentNetworkConfig.isFork &&
      currentNetworkConfig.underlyingChainId === governanceConfig?.chainId;
    const rpcProvider = isStakeFork
      ? get().jsonRpcProvider()
      : getProvider(governanceConfig.chainId);
    const governanceService = new AaveGovernanceService(rpcProvider, {
      GOVERNANCE_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2,
      GOVERNANCE_HELPER_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2_HELPER,
      ipfsGateway: governanceConfig.ipfsGateway,
    });
    const { aaveTokenAddress, stkAaveTokenAddress } = governanceConfig;
    try {
      const [aaveTokenPower, stkAaveTokenPower] = await governanceService.getTokensPower({
        user: account,
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
          account
        ),
        aavePropositionDelegatee: checkIfDelegateeIsUser(
          aaveTokenPower.delegatedAddressPropositionPower,
          account
        ),
        stkAaveVotingDelegatee: checkIfDelegateeIsUser(
          stkAaveTokenPower.delegatedAddressVotingPower,
          account
        ),
        stkAavePropositionDelegatee: checkIfDelegateeIsUser(
          stkAaveTokenPower.delegatedAddressPropositionPower,
          account
        ),
      };
      set({ powers });
    } catch (e) {
      console.log('error fetching reserves');
    }
  },
});
