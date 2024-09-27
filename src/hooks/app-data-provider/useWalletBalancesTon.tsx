import { Address, fromNano, OpenedContract } from '@ton/core';
import axios from 'axios';
import { formatUnits } from 'ethers/lib/utils';
import _ from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { JettonMinter } from 'src/contracts/JettonMinter';
import { JettonWallet } from 'src/contracts/JettonWallet';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { retry } from 'ts-retry-promise';

import { useTonClient } from '../useTonClient';
import { API_TON_V2, MAX_ATTEMPTS_50, PoolContractReservesDataType } from './useAppDataProviderTon';
import { WalletBalancesMap } from './useWalletBalances';

export interface WalletBalancesTop {
  walletBalancesTon: WalletBalancesMap;
  hasEmptyWallet: boolean;
  loading: boolean;
}
export interface TypeBalanceTokensInWalletTon {
  walletBalance: string;
  underlyingAddress: string;
}

export const useGetBalanceTon = () => {
  const client = useTonClient();

  const onGetBalanceTonNetwork = useCallback(
    async (tokenAddress: string, yourAddress: string, decimals: string | number) => {
      if (!client) {
        console.error('Client is not available.');
        return '0';
      }

      if (!yourAddress) {
        console.error('Wallet address is not available.');
        return '0';
      }

      if (!tokenAddress) {
        console.error('Token address is not provided.');
        return '0';
      }

      try {
        const balance = await retry(
          async () => {
            // Parse token and user wallet addresses
            const parsedTokenAddress = Address.parse(tokenAddress);
            const parsedWalletAddress = Address.parse(yourAddress);

            // Open the Jetton Minter contract
            const jettonMinterContract = new JettonMinter(parsedTokenAddress);
            const jettonMinterProvider = client.open(
              jettonMinterContract
            ) as OpenedContract<JettonMinter>;

            // Retrieve the Jetton Wallet address for the user
            const jettonWalletAddress = await jettonMinterProvider.getWalletAddress(
              parsedWalletAddress
            );
            if (!jettonWalletAddress) {
              console.error('Jetton wallet address not found.');
              return '0';
            }

            // Open the Jetton Wallet contract using the obtained address
            const jettonWalletContract = new JettonWallet(jettonWalletAddress);
            const jettonWalletProvider = client.open(
              jettonWalletContract
            ) as OpenedContract<JettonWallet>;

            // Fetch the Jetton balance for the user's wallet
            const fetchedBalance = await jettonWalletProvider.getJettonBalance();

            // Format and return the balance using the provided decimals
            return formatUnits(fetchedBalance || '0', decimals);
          },
          {
            retries: MAX_ATTEMPTS_50, // Maximum number of retries
            delay: 1000, // Delay between retries (1 second)
          }
        );

        return balance; // Return balance on success
      } catch (error) {
        console.error('Failed to fetch balance after retries:', error);
        return '0'; // Return '0' after max attempts
      }
    },
    [client]
  );

  const getBalanceTokenTon = useCallback(async (youAddress?: string) => {
    if (!youAddress) return '0';

    try {
      const balance = await retry(
        async () => {
          const params = { address: youAddress };
          const res = await axios.get(`${API_TON_V2}/getAddressInformation`, { params });
          const balance = res.data.result.balance;

          // Convert balance from Nano format and return as string
          return fromNano(balance).toString();
        },
        {
          retries: MAX_ATTEMPTS_50, // Maximum number of retries
          delay: 1000, // Delay between retries (1 second)
        }
      );

      return balance; // Return fetched balance
    } catch (error) {
      console.error('Failed to fetch getBalanceTokenTon after retries:', error);
      return '0'; // Return '0' if maximum attempts are reached
    }
  }, []);

  const onGetBalancesTokenInWalletTon = useCallback(
    async (
      poolContractReservesData: PoolContractReservesDataType[],
      yourAddress: string,
      isConnected: boolean
    ) => {
      let hasError = false; // Track if there were any errors during the process

      // Fetch all balances for the given pool reserves data
      const balances = await Promise.all(
        poolContractReservesData.map(async (item) => {
          const { decimals, underlyingAddress, isJetton } = item;
          let walletBalance = '0';

          if (isConnected) {
            try {
              // Fetch balance based on token type: Jetton or standard token
              walletBalance = isJetton
                ? await onGetBalanceTonNetwork(underlyingAddress.toString(), yourAddress, decimals)
                : await getBalanceTokenTon(yourAddress);
            } catch (error) {
              console.error(`Error fetching balance for token ${underlyingAddress}:`, error);
              hasError = true; // Set error flag to true in case of error
            }
          } else {
            console.warn('Not connected: Assuming all balances are zero.');
          }

          // Return the calculated wallet balance along with the underlying address
          return {
            walletBalance,
            underlyingAddress: underlyingAddress.toString().toLocaleLowerCase(),
          };
        })
      );

      // Log a message if there were errors, but return the balances regardless
      if (hasError) {
        console.warn(
          'Some balances could not be fetched successfully due to errors. Please check the logs for details.'
        );
      }

      return balances; // Return the final list of balances
    },
    [getBalanceTokenTon, onGetBalanceTonNetwork]
  );

  return {
    onGetBalanceTonNetwork,
    onGetBalancesTokenInWalletTon,
  };
};

export const useWalletBalancesTon = (reservesTon: DashboardReserve[]): WalletBalancesTop => {
  const [walletBalancesTon, setWalletBalancesTon] = useState<WalletBalancesMap>({});
  const [loading, setLoading] = useState<boolean>(false);
  useMemo(() => {
    setLoading(true);
    if (!reservesTon) return;
    const transformedData: WalletBalancesMap = {};
    reservesTon.forEach((item) => {
      const address = item.underlyingAsset;
      transformedData[address] = {
        amount: item.walletBalance,
        amountUSD: item.walletBalanceUSD,
      };
    });
    setWalletBalancesTon(transformedData);
    setLoading(false);
  }, [reservesTon]);

  return {
    walletBalancesTon,
    hasEmptyWallet: _.isEmpty(walletBalancesTon),
    loading: loading,
  };
};
