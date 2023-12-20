import { ChainId, Payload } from '@aave/contract-helpers';
import { useQuery } from '@tanstack/react-query';
import { GovernanceV3Service } from 'src/services/GovernanceV3Service';
import { VotingChain } from 'src/ui-config/governanceConfig';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type PayloadParams = {
  payloadControllerAddress: string;
  payloadId: number;
  chainId: ChainId;
};

type PayloadData = {
  [key in ChainId]: {
    [payloadsControllerAddres: string]: number[];
  };
};

export const usePayloadsData = (params: PayloadParams[]) => {
  const { governanceV3Service } = useSharedDependencies();
  return useQuery({
    queryFn: () => fetchPayloadsData(params, governanceV3Service),
    queryKey: ['payloadsData'], // TODO
    enabled: !!params.length,
  });
};

async function fetchPayloadsData(params: PayloadParams[], service: GovernanceV3Service) {
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

  const promises: Promise<Payload[]>[] = [];
  Object.entries(payloadsByChainId).forEach(([chainId, payloads]) => {
    const chainIdKey = +chainId as VotingChain;
    Object.entries(payloads).forEach(([payloadControllerAddress, payloadIds]) => {
      promises.push(service.getPayloadsData(payloadControllerAddress, payloadIds, chainIdKey));
    });
  });

  const data = await Promise.all(promises);
  console.log(data.flat());
  return data.flat();
}
