import { AaveGovernanceService, ChainId, Power } from '@aave/contract-helpers';
import { normalize, valueToBigNumber } from '@aave/math-utils';
import { Provider } from '@ethersproject/providers';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
// import { MarketDataType } from 'src/ui-config/marketsConfig';

export interface Powers {
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
  aAaveTokenPower: Power;
}

// interface VoteOnProposalData {
//   votingPower: string;
//   support: boolean;
// }

const AAVE_GOVERNANCE_V2 = '0xEC568fffba86c094cf06b22134B23074DFE2252c';

export class GovernanceService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getAaveGovernanceService(chainId: ChainId) {
    const provider = this.getProvider(chainId);
    return new AaveGovernanceService(provider, {
      GOVERNANCE_ADDRESS: AAVE_GOVERNANCE_V2,
      GOVERNANCE_HELPER_ADDRESS: governanceV3Config.addresses.TOKEN_POWER_HELPER,
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

  async getPowers(govChainId: ChainId, user: string, blockHash?: string): Promise<Powers> {
    const { aaveTokenAddress, stkAaveTokenAddress, aAaveTokenAddress } =
      governanceV3Config.votingAssets;

    const aaveGovernanceService = this.getAaveGovernanceService(govChainId);

    const options: { blockTag?: string } = {};
    if (blockHash) {
      options.blockTag = blockHash;
    }

    const [aaveTokenPower, stkAaveTokenPower, aAaveTokenPower] =
      // pass blockhash here as optional
      await aaveGovernanceService.getTokensPower(
        {
          user: user,
          tokens: [aaveTokenAddress, stkAaveTokenAddress, aAaveTokenAddress],
        },
        options
      );
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
      aAaveVotingDelegatee: aAaveTokenPower.delegatedAddressVotingPower,
      aAavePropositionDelegatee: aAaveTokenPower.delegatedAddressPropositionPower,

      aaveVotingDelegatee: aaveTokenPower.delegatedAddressVotingPower,
      aavePropositionDelegatee: aaveTokenPower.delegatedAddressPropositionPower,

      stkAaveVotingDelegatee: stkAaveTokenPower.delegatedAddressVotingPower,

      stkAavePropositionDelegatee: stkAaveTokenPower.delegatedAddressPropositionPower,
    };
    return powers;
  }
}
