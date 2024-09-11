import { Address, beginCell, Cell, storeMessage } from '@ton/core';
import axios from 'axios';
import _, { reject } from 'lodash';
import { useCallback } from 'react';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { sleep } from 'src/utils/rotationProvider';
import { retry } from 'ts-retry-promise';

import { API_TON_V3, MAX_ATTEMPTS } from './app-data-provider/useAppDataProviderTon';
import { useTonClientV2 } from './useTonClient';

type DataType = {
  [key: string]: {
    user_friendly: string;
  };
};

type KnownAddressesType = string[];

function getRemainingFriendlyAddresses(
  data: DataType,
  knownAddresses: KnownAddressesType
): string | null {
  const remaining: string[] = [];

  for (const key in data) {
    const userFriendly = data[key].user_friendly;

    if (!knownAddresses.includes(userFriendly)) {
      remaining.push(userFriendly);
    }
  }

  return remaining.length > 0 ? remaining[0] : null;
}

export default function convertHexToBase64(hexString: string) {
  const buffer = Buffer.from(hexString, 'hex');

  return buffer.toString('base64');
}

export function useTonGetTxByBOC() {
  const { walletAddressTonWallet } = useTonConnectContext();
  const client = useTonClientV2();

  const onGetGetTxByBOC = useCallback(
    async (exBoc: string, _add: string) => {
      if (!client || !walletAddressTonWallet || !_add || !exBoc) return;
      const myAddress = Address.parse(_add);
      return retry(
        async () => {
          const transactions = await client.getTransactions(myAddress, {
            limit: 5,
          });
          for (const tx of transactions) {
            const inMsg = tx.inMessage;
            if (inMsg?.info.type === 'external-in') {
              const inBOC = inMsg?.body;
              if (typeof inBOC === 'undefined') {
                reject(new Error('Invalid external'));
                continue;
              }
              const extHash = Cell.fromBase64(exBoc).hash().toString('hex');
              const inHash = beginCell()
                .store(storeMessage(inMsg))
                .endCell()
                .hash()
                .toString('hex');

              // console.log(' hash BOC', extHash);
              console.log('inMsg hash', inHash);
              // console.log('checking the tx', tx, tx.hash().toString('hex'));

              // Assuming `inBOC.hash()` is synchronous and returns a hash object with a `toString` method
              if (extHash === inHash) {
                // console.log('Tx match');
                const txHash = tx.hash().toString('hex');
                console.log(`Transaction Hash: ${txHash}`);
                // console.log(`Transaction LT: ${tx.lt}`);
                return txHash;
              }
            }
          }
          throw new Error('Transaction not found');
        },
        { retries: 30, delay: 1000 }
      );
    },
    [client, walletAddressTonWallet]
  );

  const getTransactionsUser = useCallback(async (account: string, traceIdToFind: string) => {
    let attempts = 0;
    const maxAttempts = 50;

    const fetchTransactions = async () => {
      try {
        attempts++;
        const params = {
          account,
          limit: 10,
          offset: 0,
          sort: 'desc',
        };

        const { data } = await axios.get(`${API_TON_V3}/transactions`, { params });

        const transactions = data.transactions || [];
        const result = _.find(transactions, { trace_id: traceIdToFind });

        if (result) {
          return result.description?.compute_ph?.success || false;
        } else {
          if (attempts < maxAttempts) {
            await sleep(2000);
            return fetchTransactions();
          } else {
            return false;
          }
        }
      } catch (error) {
        console.error(`Error fetching data (Attempt ${attempts}/${maxAttempts}):`, error);
        if (attempts < maxAttempts) {
          await sleep(1000);
          return fetchTransactions();
        } else {
          throw new Error('Max retry attempts reached.');
        }
      }
    };

    return await fetchTransactions();
  }, []);

  const getTransactionStatus = useCallback(
    async (txHash: string) => {
      let attempts = 0;
      const maxAttempts = MAX_ATTEMPTS;

      const fetchStatusTransaction = async (): Promise<boolean | null> => {
        try {
          attempts++;
          if (!txHash) return null;

          const params = {
            hash: txHash,
          };

          const { data } = await axios.get(`${API_TON_V3}/adjacentTransactions`, { params });
          const address_books = _.values(data.address_book);

          const lastElementAddress = _.last(address_books);

          if (!lastElementAddress) {
            console.error('No valid address found');
            return null;
          }

          const user_friendly_transaction = lastElementAddress.user_friendly;
          const txHashBase64 = convertHexToBase64(txHash);

          const result = await getTransactionsUser(user_friendly_transaction, txHashBase64);
          return result;
        } catch (error) {
          attempts += 1;
          console.error(`Error fetching data (Attempt ${attempts}/${maxAttempts}):`, error);
          if (attempts < maxAttempts) {
            await sleep(2000);
            return fetchStatusTransaction();
          } else {
            throw new Error('Max retry attempts reached.');
          }
        }
      };

      return await fetchStatusTransaction();
      // try {
      //   // const myAddress = Address.parse(walletAddress);
      //   // const transactions = await client.getTransactions(myAddress, {
      //   //   limit: 10,
      //   // });

      //   const res = await fetch(`${API_TON_V3}/adjacentTransactions?hash=${txHash}`);
      //   // const transaction = await res.json();

      //   console.log('------------------------------------------', res);

      //   // for (const tx of transactions) {
      //   //   if (tx.hash().toString('hex') === txHash) {
      //   //     return tx;
      //   //   }
      //   // }

      //   // throw new Error('Transaction not found');
      // } catch (error) {
      //   console.error('Error fetching transaction status:', error);
      //   throw error;
      // }
    },
    [getTransactionsUser]
  );

  return {
    onGetGetTxByBOC,
    getTransactionStatus,
  };
}
