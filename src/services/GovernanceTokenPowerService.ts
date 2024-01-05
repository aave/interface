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
}

export class GovernanceTokenPowerService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getAaveGovernanceService(chainId: ChainId) {
    const provider = this.getProvider(chainId);
    // This is the legacy governance service that we are only using to fetch token powers.
    // the GOVERNANCE_ADDRESS is not used in that case, but is required by the service.
    return new AaveGovernanceService(provider, {
      GOVERNANCE_ADDRESS: governanceV3Config.addresses.GOVERNANCE_CORE,
      GOVERNANCE_HELPER_ADDRESS: governanceV3Config.addresses.TOKEN_POWER_HELPER,
    });
  }

  async getPowers(govChainId: ChainId, user: string): Promise<Powers> {
    const { aaveTokenAddress, stkAaveTokenAddress, aAaveTokenAddress } =
      governanceV3Config.votingAssets;

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
