import { Address, beginCell, Cell, storeMessage } from '@ton/core';
import axios from 'axios';
import _, { reject } from 'lodash';
import { useCallback } from 'react';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { sleep } from 'src/utils/rotationProvider';
import { retry } from 'ts-retry-promise';

import { API_TON_SCAN_V2 } from './app-data-provider/useAppDataProviderTon';
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flattenData = useCallback((data: any[]): any[] => {
    return _.flatMap(data, (item) => {
      const { children, ...rest } = item;
      return [rest, ...(children ? flattenData(children) : [])];
    });
  }, []);

  const getTransactionStatus = useCallback(
    async (txHash: string) => {
      let attempts = 0;
      const maxAttempts = 50;

      const fetchStatusTransaction = async (): Promise<boolean | null> => {
        while (attempts < maxAttempts) {
          try {
            attempts++;
            if (!txHash) return null;

            const { data } = await axios.get(`${API_TON_SCAN_V2}/traces/${txHash}`);
            const children = data.children;

            if (children) {
              const dataFlatten = flattenData(children);
              const pending = dataFlatten.some(
                (item) =>
                  Array.isArray(item?.transaction?.out_msgs) && item.transaction.out_msgs.length > 0
              );
              console.log('Transaction-----pending:', pending, dataFlatten);

              if (pending) {
                console.log('Transaction-----pending');
                await sleep(4000); // Retry after sleep if pending
              } else if (dataFlatten.some((item) => item.transaction.aborted === true)) {
                console.log('Transaction-----false');
                return false;
              } else {
                console.log('Transaction-----true');
                return true;
              }
            } else {
              await sleep(4000); // Retry if no children data
            }
          } catch (error) {
            console.error(`Error fetching data (Attempt ${attempts}/${maxAttempts}):`, error);
            if (attempts >= maxAttempts) {
              throw new Error('Max retry attempts reached.');
            }
            await sleep(4000); // Retry after sleep if error occurs
          }
        }
        return null; // Return null if max attempts reached without success
      };

      return await fetchStatusTransaction();
    },
    [flattenData]
  );

  return {
    onGetGetTxByBOC,
    getTransactionStatus,
  };
}
