import {
  ChainId,
  VotingMachineDataHelperService,
  VotingMachineProposal,
} from '@aave/contract-helpers';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

const votingPortalSepolia = '0x1079bAa48E56065d43b4344866B187a485cb0A92';
const votingPortalFuji = '0x4f47EdF2577995aBd7B875Eed75b3F28a20E696F';
const votingMachineSepolia = '0xA1995F1d5A8A247c064a76F336E1C2ecD24Ef0D9';
const votingMachineFuji = '0x767AA57554690D23D1E0594E8746271C97e1A1e4';
const votingPortalDataHelperSepolia = '0x133210F3fe2deEB34e65deB6861ee3dF87393977';
const votingPortalDataHelperFuji = '0x133210F3fe2deEB34e65deB6861ee3dF87393977';

type VotingChainProposal = {
  [chainId: number]: {
    [votingPortalAddress: string]: Array<{
      id: number;
      snapshotBlockHash: string;
    }>;
  };
};

// TODO: clean this up, we can pull from the address book
const votingMachineMap: {
  [chainId: number]: { [votingPortalAddress: string]: string };
} = {
  [ChainId.sepolia]: {
    [votingPortalSepolia]: votingMachineSepolia,
    votingPortalDataHelper: votingPortalDataHelperSepolia,
  },
  [ChainId.fuji]: {
    [votingPortalFuji]: votingMachineFuji,
    votingPortalDataHelper: votingPortalDataHelperFuji,
  },
};

export class VotingMachineService {
  private getDataHelperService(chainId: ChainId) {
    const provider = getProvider(chainId);
    return new VotingMachineDataHelperService(
      votingMachineMap[chainId].votingPortalDataHelper,
      provider
    );
  }
  async getProposalsData(
    proposals: Array<{
      id: number;
      snapshotBlockHash: string;
      chainId: number;
      votingPortalAddress: string;
    }>
  ) {
    const proposalsByVotingChainId: VotingChainProposal = proposals.reduce((acc, proposal) => {
      const chainId = proposal.chainId;
      const votingPortalAddress = proposal.votingPortalAddress;

      if (!acc[chainId]) {
        acc[chainId] = {};
      }

      if (!acc[chainId][votingPortalAddress]) {
        acc[chainId][votingPortalAddress] = [];
      }

      acc[chainId][votingPortalAddress].push({
        id: proposal.id,
        snapshotBlockHash: proposal.snapshotBlockHash,
      });
      return acc;
    }, {} as VotingChainProposal);

    console.log('props by chain id', proposalsByVotingChainId);

    const promises: Promise<VotingMachineProposal[]>[] = [];
    Object.entries(proposalsByVotingChainId).forEach(([chainId, proposals]) => {
      const dataHelperService = this.getDataHelperService(+chainId);
      Object.entries(proposals).forEach(([votingPortalAddress, proposals]) => {
        promises.push(
          dataHelperService.getProposalsData(
            votingMachineMap[+chainId][votingPortalAddress],
            proposals,
            '0x0000000000000000000000000000000000000000'
          )
        );
      });
    });

    const data = await Promise.all(promises);

    const merged = data.reduce((acc, proposals) => {
      return [...acc, ...proposals];
    }, [] as VotingMachineProposal[]);

    return merged.sort((a, b) => +b.proposalData.id - +a.proposalData.id);
  }
}
