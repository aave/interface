import { Address, beginCell, Cell, storeMessage } from '@ton/core';
import { reject } from 'lodash';
import { useCallback } from 'react';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { retry } from 'ts-retry-promise';

import { useTonClient } from './useTonClient';

export function useTonGetTxByBOC() {
  const { walletAddressTonWallet } = useTonConnectContext();
  const client = useTonClient();

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

              console.log(' hash BOC', extHash);
              console.log('inMsg hash', inHash);
              console.log('checking the tx', tx, tx.hash().toString('hex'));

              // Assuming `inBOC.hash()` is synchronous and returns a hash object with a `toString` method
              if (extHash === inHash) {
                console.log('Tx match');
                const txHash = tx.hash().toString('hex');
                console.log(`Transaction Hash: ${txHash}`);
                console.log(`Transaction LT: ${tx.lt}`);
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

  const getTransactionStatus = useCallback(
    async (txHash: string, walletAddress: string) => {
      if (!client || !walletAddressTonWallet || !txHash || !walletAddress) return;
      try {
        const myAddress = Address.parse(walletAddress);
        const transactions = await client.getTransactions(myAddress, {
          limit: 5,
        });

        for (const tx of transactions) {
          if (tx.hash().toString('hex') === txHash) {
            return tx;
          }
        }

        throw new Error('Transaction not found');
      } catch (error) {
        console.error('Error fetching transaction status:', error);
        throw error;
      }
    },
    [client, walletAddressTonWallet]
  );

  return {
    onGetGetTxByBOC,
    getTransactionStatus,
  };
}
