import { AaveGovernanceService, ChainId, Power, tEthereumAddress } from '@aave/contract-helpers';
import { normalize, valueToBigNumber } from '@aave/math-utils';
import { Provider } from '@ethersproject/providers';
import { ZERO_ADDRESS } from 'src/modules/governance/utils/formatProposal';
import { governanceConfig } from 'src/ui-config/governanceConfig';
// import { MarketDataType } from 'src/ui-config/marketsConfig';

interface Powers {
  votingPower: string;
  aaveTokenPower: Power;
  stkAaveTokenPower: Power;
  propositionPower: string;
  aaveVotingDelegatee: string;
  aavePropositionDelegatee: string;
  stkAaveVotingDelegatee: string;
  stkAavePropositionDelegatee: string;
  aAaveVotingDelegatee: string;
  aAavePropositionDelegatee: string;
}

// interface VoteOnProposalData {
//   votingPower: string;
//   support: boolean;
// }

const checkIfDelegateeIsUser = (delegatee: tEthereumAddress, userAddress: tEthereumAddress) =>
  delegatee == ZERO_ADDRESS || delegatee.toLocaleLowerCase() === userAddress.toLocaleLowerCase()
    ? ''
    : delegatee;
export class GovernanceService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getAaveGovernanceService(chainId: ChainId) {
    const provider = this.getProvider(chainId);
    return new AaveGovernanceService(provider, {
      GOVERNANCE_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2,
      GOVERNANCE_HELPER_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2_HELPER,
      ipfsGateway: governanceConfig.ipfsGateway,
    });
  }

  // async getVotingPowerAt(
  //   marketData: MarketDataType,
  //   user: string,
  //   strategy: string,
  //   block: number
  // ) {
  //   const aaveGovernanceService = this.getAaveGovernanceService(marketData);
  //   return aaveGovernanceService.getVotingPowerAt({
  //     user,
  //     strategy,
  //     block,
  //   });
  // }

  // async getVoteOnProposal(
  //   marketData: MarketDataType,
  //   user: string,
  //   proposalId: number
  // ): Promise<VoteOnProposalData> {
  //   const aaveGovernanceService = this.getAaveGovernanceService(marketData);
  //   const { votingPower, support } = await aaveGovernanceService.getVoteOnProposal({
  //     user,
  //     proposalId,
  //   });
  //   return {
  //     votingPower: normalize(votingPower.toString(), 18),
  //     support,
  //   };
  // }

  async getPowers(govChainId: ChainId, user: string): Promise<Powers> {
    const { aaveTokenAddress, stkAaveTokenAddress, aAaveTokenAddress } = governanceConfig;

    const aaveGovernanceService = this.getAaveGovernanceService(govChainId);

    const [aaveTokenPower, stkAaveTokenPower, aAaveTokenPower] =
      await aaveGovernanceService.getTokensPower({
        user: user,
        tokens: [aaveTokenAddress, stkAaveTokenAddress, aAaveTokenAddress],
      });
    // todo setup powers for aAaveToken
    const powers = {
      votingPower: normalize(
        valueToBigNumber(aaveTokenPower.votingPower.toString())
          .plus(stkAaveTokenPower.votingPower.toString())
          .plus(aAaveTokenPower.votingPower.toString())
          .toString(),
        18
      ),
      aAaveTokenPower,
      aaveTokenPower,
      stkAaveTokenPower,
      propositionPower: normalize(
        valueToBigNumber(aaveTokenPower.propositionPower.toString())
          .plus(stkAaveTokenPower.propositionPower.toString())
          .plus(aAaveTokenPower.votingPower.toString())
          .toString(),
        18
      ),
      aAaveVotingDelegatee: checkIfDelegateeIsUser(
        aAaveTokenPower.delegatedAddressVotingPower,
        user
      ),
      aAavePropositionDelegatee: checkIfDelegateeIsUser(
        aAaveTokenPower.delegatedAddressPropositionPower,
        user
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
}
