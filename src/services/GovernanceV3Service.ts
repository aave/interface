import { AccessLevel, ChainId, GovernanceDataHelperService } from '@aave/contract-helpers';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

const govCoreAddressSepolia = '0xc4ABF658C3Dda84225cF8A07d7D5Bb6Aa41d9E59';
const govDataHelperSepolia = '0x863f9De2f82AB502612E8B7d4f4863c8535cb8cA';
const votingPortalSepolia = '0x1079bAa48E56065d43b4344866B187a485cb0A92';

export class GovernanceV3Service {
  private getDataHelperService() {
    const provider = getProvider(ChainId.sepolia); // TODO: pass in market data
    return new GovernanceDataHelperService(govDataHelperSepolia, provider);
  }

  async getProposalsData(from = 0, to = 0, limit = 10) {
    const dataHelperService = this.getDataHelperService();
    const proposals = await dataHelperService.getProposalsData(
      govCoreAddressSepolia,
      from,
      to,
      limit
    );
    return proposals;
  }

  async getVotingConfig() {
    const dataHelperService = this.getDataHelperService();
    const votingConfig = await dataHelperService.getConstants(govCoreAddressSepolia, [
      AccessLevel.Short_Executor,
      AccessLevel.Long_Executor,
    ]);
    return votingConfig;
  }
}
