import {
  AaveGovernanceService,
  GovGetVoteOnProposal,
  GovGetVotingAtBlockType,
  Power,
  tEthereumAddress,
} from '@aave/contract-helpers';
import { normalize, valueToBigNumber } from '@aave/math-utils';
import { Provider } from '@ethersproject/providers';
import { governanceConfig } from 'src/ui-config/governanceConfig';

import { GenericService } from './GenericService';

export interface Powers {
  votingPower: string;
  aaveTokenPower: Power;
  stkAaveTokenPower: Power;
  propositionPower: string;
  aaveVotingDelegatee: string;
  aavePropositionDelegatee: string;
  stkAaveVotingDelegatee: string;
  stkAavePropositionDelegatee: string;
}

interface GetPowersArgs {
  user: string;
}

const checkIfDelegateeIsUser = (delegatee: tEthereumAddress, userAddress: tEthereumAddress) =>
  delegatee.toLocaleLowerCase() === userAddress.toLocaleLowerCase() ? '' : delegatee;

export class GovernanceService implements GenericService {
  private readonly governanceService: AaveGovernanceService;

  constructor(provider: Provider, public readonly chainId: number) {
    this.governanceService = new AaveGovernanceService(provider, {
      GOVERNANCE_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2,
      GOVERNANCE_HELPER_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2_HELPER,
      ipfsGateway: governanceConfig.ipfsGateway,
    });
  }

  async getVotingPowerAt(request: GovGetVotingAtBlockType) {
    return this.governanceService.getVotingPowerAt(request);
  }
  async getVoteOnProposal(request: GovGetVoteOnProposal) {
    const { votingPower, support } = await this.governanceService.getVoteOnProposal(request);
    return {
      votingPower: normalize(votingPower.toString(), 18),
      support,
    };
  }
  async getPowers({ user }: GetPowersArgs) {
    const { aaveTokenAddress, stkAaveTokenAddress } = governanceConfig;
    const [aaveTokenPower, stkAaveTokenPower] = await this.governanceService.getTokensPower({
      user: user,
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
      aaveVotingDelegatee: checkIfDelegateeIsUser(aaveTokenPower.delegatedAddressVotingPower, user),
      aavePropositionDelegatee: checkIfDelegateeIsUser(
        aaveTokenPower.delegatedAddressPropositionPower,
        user
      ),
      stkAaveVotingDelegatee: checkIfDelegateeIsUser(
        stkAaveTokenPower.delegatedAddressVotingPower,
        user
      ),
      stkAavePropositionDelegatee: checkIfDelegateeIsUser(
        stkAaveTokenPower.delegatedAddressPropositionPower,
        user
      ),
    };
    return powers;
  }
  public toHash() {
    return this.chainId.toString();
  }
}
