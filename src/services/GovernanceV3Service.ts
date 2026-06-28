import {
  AaveTokenV3Service,
  AccessLevel,
  ChainId,
  GovernanceCoreService,
  GovernanceDataHelperService,
  GovernancePowerType,
  Payload,
  PayloadsDataHelperService,
} from '@aave/contract-helpers';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export type PayloadParams = {
  payloadControllerAddress: string;
  payloadId: number;
  chainId: ChainId;
};

type PayloadData = {
  [key in ChainId]: {
    [payloadsControllerAddres: string]: number[];
  };
};

export type EnhancedPayload = Payload & {
  chainId: number;
};

export class GovernanceV3Service {
  private getDataHelperService() {
    const provider = getProvider(governanceV3Config.coreChainId);
    return new GovernanceDataHelperService(
      governanceV3Config.addresses.GOVERNANCE_DATA_HELPER,
      provider
    );
  }

  private getCoreService() {
    const provider = getProvider(governanceV3Config.coreChainId);
    return new GovernanceCoreService(governanceV3Config.addresses.GOVERNANCE_CORE, provider);
  }

  private getPayloadDataHelperService(chainId: ChainId) {
    const provider = getProvider(chainId);
    const payload = new PayloadsDataHelperService(
      governanceV3Config.payloadsControllerDataHelpers[chainId],
      provider
    );
    return payload;
  }

  async getProposalsData(from = 0, to = 0, limit = 10) {
    const dataHelperService = this.getDataHelperService();
    const proposals = await dataHelperService.getProposalsData(
      governanceV3Config.addresses.GOVERNANCE_CORE,
      from,
      to,
      limit
    );
    return proposals;
  }

  async getVotingConfig() {
    const dataHelperService = this.getDataHelperService();
    const votingConfig = await dataHelperService.getConstants(
      governanceV3Config.addresses.GOVERNANCE_CORE,
      [AccessLevel.Short_Executor, AccessLevel.Long_Executor]
    );
    return votingConfig;
  }

  async getProposalCount() {
    const coreService = this.getCoreService();
    return coreService.getProposalCount();
  }

  async getRepresentationData(user: string) {
    const dataHelperService = this.getDataHelperService();
    const representationData = await dataHelperService.getRepresentationData(
      governanceV3Config.addresses.GOVERNANCE_CORE,
      user,
      [...governanceV3Config.votingChainIds]
    );
    return representationData;
  }

  updateRepresentativesForChain(
    user: string,
    representatives: Array<{ chainId: ChainId; representative: string }>
  ) {
    const coreService = this.getCoreService();
    return coreService.updateRepresentativesForChain(user, representatives);
  }

  async getVotingPowerAt(blockHash: string, user: string, votingAssets: string[]) {
    const provider = getProvider(governanceV3Config.coreChainId);
    const block = await provider.getBlock(blockHash);

    const tokenServices = votingAssets.map((token) => {
      return {
        asset: token,
        service: new AaveTokenV3Service(token, provider),
      };
    });
    const result = await Promise.all(
      tokenServices.map(
        async (s) => (await s.service.getPowerAt(block.number, user, GovernancePowerType.VOTING))[0]
      )
    );
    const totalPower = result.reduce((acum, elem) => acum.add(elem), BigNumber.from(0));
    return formatUnits(totalPower, 18);
  }

  async getPayloadsData(payloadsControllerAddress: string, payloadIds: number[], chainId: ChainId) {
    const dataHelperService = this.getPayloadDataHelperService(chainId);
    const payloadsData = await dataHelperService.getPayloadsData(
      payloadsControllerAddress,
      payloadIds
    );
    return payloadsData;
  }

  async getMultiChainPayloadsData(params: PayloadParams[]) {
    const payloadsByChainId: PayloadData = params.reduce(
      (acc, { chainId, payloadControllerAddress, payloadId }) => {
        if (!acc[chainId]) {
          acc[chainId] = {};
        }

        if (!acc[chainId][payloadControllerAddress]) {
          acc[chainId][payloadControllerAddress] = [];
        }

        acc[chainId][payloadControllerAddress].push(payloadId);
        return acc;
      },
      {} as PayloadData
    );

    const promises: Promise<EnhancedPayload[]>[] = [];
    Object.entries(payloadsByChainId).forEach(([chainId, payloads]) => {
      const chainIdKey = +chainId;
      Object.entries(payloads).forEach(([payloadControllerAddress, payloadIds]) => {
        promises.push(
          this.getPayloadsData(payloadControllerAddress, payloadIds, chainIdKey).then((data) =>
            data.map((payload) => ({ ...payload, chainId: chainIdKey }))
          )
        );
      });
    });

    const data = await Promise.all(promises);
    return data.flat();
  }
}
