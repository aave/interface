import { ChainId, VotingMachineDataHelperService } from '@aave/contract-helpers';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

const votingPortalSepolia = '0x1079bAa48E56065d43b4344866B187a485cb0A92';
const votingMachineSepolia = '0xA1995F1d5A8A247c064a76F336E1C2ecD24Ef0D9';
const votingPortalDataHelperSepolia = '0x133210F3fe2deEB34e65deB6861ee3dF87393977';

export class VotingMachineService {
  private getDataHelperService() {
    const provider = getProvider(ChainId.sepolia); // TODO: pass in market data
    return new VotingMachineDataHelperService(votingPortalDataHelperSepolia, provider);
  }
  async getProposalsData(proposals: Array<{ id: number; snapshotBlockHash: string }>) {
    const dataHelperService = this.getDataHelperService();
    const data = await dataHelperService.getProposalsData(
      votingMachineSepolia,
      proposals,
      '0x0000000000000000000000000000000000000000'
    );

    console.log(data);
    return data;
  }
}
