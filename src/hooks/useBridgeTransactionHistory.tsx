import { useQuery } from '@tanstack/react-query';
import request, { gql } from 'graphql-request';

type SubgraphBridgeTransaction = {
  address: string;
  network: string;
  blockTimestamp: string;
  message_messageId: string;
  message_sender: string;
  message_receiver: string;
  message_sequenceNumber: string;
  message_tokenAmounts: {
    amount: string;
    token: string;
  }[];
};

export type BridgeTransaction = {
  onRampAddress: string;
  sourceNetwork: string;
  blockTimestamp: number;
  sender: string;
  receiver: string;
  sequenceNumber: string;
  tokenAmounts: {
    amount: string;
    token: string;
  }[];
};

const sourceNetworkSubgraphUrls = [
  'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/gho-ccip-base-sepolia/1.0.0/gn',
  'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/gho-ccip-arb-sepolia/1.0.0/gn',
  'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/gho-ccip-sepolia/1.0.0/gn',
];

// There should typically only be 1 on-ramp per off-ramp. But, in the case where there is a new off-ramp added,
// the old one will be kept for a period of time to let old transactions be manually executed. For testnets,
// these are not cleaned up, so that's why there are so many configured for some networks.

// TODO: we can query the offramps for a given destination network on the router. Just hardcoding in config for now.
export const networkRampMap = {
  'base-sepolia': {
    '0x6486906bB2d85A6c0cCEf2A2831C11A2059ebfea': ['0x189F61D9B886Dd2975D5Abc893c8Cf5f5effda71'], // base -> eth
    '0x58622a80c6DdDc072F2b527a99BE1D0934eb2b50': ['0xd364C06ac99a82a00d3eFF9F2F78E4Abe4b9baAA'], // base -> arb
    '0xAbA09a1b7b9f13E05A6241292a66793Ec7d43357': ['0xAd91214efFee446500940c764DF77AF18427294F'], // base -> avax
  },
  'arbitrum-sepolia': {
    '0x4205E1Ca0202A248A5D42F5975A8FE56F3E302e9': [
      '0x05CA154DaEaC949f175489A8fdb19f85575a689F',
      '0x1c71f141b4630EBE52d6aF4894812960abE207eB',
    ], // arb -> eth
    '0x7854E73C73e7F9bb5b0D5B4861E997f4C6E8dcC6': ['0xc1982985720B959E66c19b64F783361Eb9B60F26'], // arb -> base
  },
  sepolia: {
    '0xe4Dd3B16E09c016402585a8aDFdB4A18f772a07e': [
      '0x0Fbba29c5A9C4fCF13eC9f6f30C12c19DE3ca6b2',
      '0xF18896AB20a09A29e64fdEbA99FDb8EC328f43b1',
    ], // eth -> arb
    '0x2B70a05320cB069e0fB55084D402343F832556E7': [
      '0xE93a82721b43ba19cBB0C48966423935a4Eb2835',
      '0x1c4fAe320B6eBeE12bCdE232038950879534F228',
      '0x9069897aA4E028dfA6a263d7c644BA58F867A14E',
      '0x81F23D770D3b3E91A06Ee6b37Ef00e538874378d',
      '0x1983e91E6DeF3e093231e7c8BDE347043D9a8C34',
      '0xd668595630573E5e68aA2cB9295a4180f38B7Ef9',
      '0x31c0B81832B333419f0DfD36A69F502cF9094aed',
    ], // eth -> base
    '0x0477cA0a35eE05D3f9f424d88bC0977ceCf339D4': ['0x000b26f604eAadC3D874a4404bde6D64a97d95ca'], // eth -> avax
  },
};

const sendRequestsQuery = gql`
  query getSendRequests($sender: String!) {
    ccipsendRequests(where: { message_sender: $sender }) {
      blockTimestamp
      address
      network
      message_messageId
      message_sender
      message_receiver
      message_sequenceNumber
      message_tokenAmounts {
        amount
        token
      }
    }
  }
`;

const getSendRequests = async (url: string, sender: string) => {
  const result = await request<{ ccipsendRequests: SubgraphBridgeTransaction[] }>(
    url,
    sendRequestsQuery,
    {
      sender,
    }
  );

  console.log(result);

  return result.ccipsendRequests
    .map<BridgeTransaction>((tx) => ({
      onRampAddress: tx.address,
      sourceNetwork: tx.network,
      blockTimestamp: Number(tx.blockTimestamp),
      sender: tx.message_sender,
      receiver: tx.message_receiver,
      sequenceNumber: tx.message_sequenceNumber,
      tokenAmounts: tx.message_tokenAmounts,
    }))
    .sort((a, b) => b.blockTimestamp - a.blockTimestamp);
};

const mergeAndSortTransactions = (transactions: BridgeTransaction[][]) => {
  return transactions.flat().sort((a, b) => b.blockTimestamp - a.blockTimestamp);
};

export const useBridgeTransactionHistory = (sender: string) => {
  return useQuery({
    queryFn: async () => {
      const txs = await Promise.all(
        sourceNetworkSubgraphUrls.map((url) => getSendRequests(url, sender))
      );
      return mergeAndSortTransactions(txs);
    },
    queryKey: ['sendRequests', sender],
  });
};
