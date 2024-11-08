import { ChainId } from '@aave/contract-helpers';
import { useQuery } from '@tanstack/react-query';
import request, { gql } from 'graphql-request';
import { getChainIdFor, laneConfig } from 'src/components/transactions/Bridge/BridgeConfig';

type SubgraphBridgeTransaction = {
  id: string;
  address: string;
  network: string;
  blockTimestamp: string;
  message_messageId: string;
  message_sender: string;
  message_receiver: string;
  message_sequenceNumber: string;
  message_sourceChainSelector: string;
  message_tokenAmounts: {
    amount: string;
    token: string;
  }[];
  transactionHash: string;
  destChainSelector: string;
};

export type BridgeTransaction = {
  id: string;
  onRampAddress: string;
  sourceNetwork: string;
  sourceChainId: ChainId;
  destinationChainId: ChainId;
  blockTimestamp: number;
  sender: string;
  receiver: string;
  sequenceNumber: string;
  tokenAmounts: {
    amount: string;
    token: string;
  }[];
  transactionHash: string;
};

const sendRequestsQuery = gql`
  query getSendRequests($sender: String!) {
    ccipsendRequests(where: { message_sender: $sender }) {
      id
      blockTimestamp
      address
      network
      message_messageId
      message_sender
      message_receiver
      message_sequenceNumber
      message_sourceChainSelector
      message_tokenAmounts {
        amount
        token
      }
      transactionHash
      destChainSelector
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

  return result.ccipsendRequests
    .map((tx) => {
      try {
        // If this throws, it's because there was a tx to a chain that is not currently
        // supported in the UI (should mainly just be testnets). Just filter out those txs.
        const sourceChainId = getChainIdFor(tx.message_sourceChainSelector);
        const destinationChainId = getChainIdFor(tx.destChainSelector);

        return {
          id: tx.id,
          onRampAddress: tx.address,
          sourceNetwork: tx.network,
          sourceChainId,
          destinationChainId,
          blockTimestamp: Number(tx.blockTimestamp),
          sender: tx.message_sender,
          receiver: tx.message_receiver,
          sequenceNumber: tx.message_sequenceNumber,
          tokenAmounts: tx.message_tokenAmounts,
          transactionHash: tx.transactionHash,
        };
      } catch (e) {
        console.error(e);
        return null;
      }
    })
    .filter((tx): tx is BridgeTransaction => tx !== null)
    .sort((a, b) => b.blockTimestamp - a.blockTimestamp);
};

const mergeAndSortTransactions = (transactions: BridgeTransaction[][]) => {
  return transactions.flat().sort((a, b) => b.blockTimestamp - a.blockTimestamp);
};

export const useBridgeTransactionHistory = (sender: string) => {
  return useQuery({
    queryFn: async () => {
      const txs = await Promise.all(
        laneConfig.map((config) => getSendRequests(config.subgraphUrl, sender))
      );
      return mergeAndSortTransactions(txs);
    },
    queryKey: ['sendRequests', sender],
    enabled: !!sender,
  });
};
