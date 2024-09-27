import axios from 'axios';
import _ from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import useSocket from 'src/utils/connectSocket';
import { retry } from 'ts-retry-promise';

import { defaultRateUSDNotValue, MAX_ATTEMPTS_50, URL_API_BE } from './useAppDataProviderTon';

export type WalletBalanceUSD = {
  id: string;
  address: string;
  usd: string;
  decimal: number;
  signature: string;
};

export const useSocketGetRateUSD = () => {
  const walletSocketRef = useRef(null);
  const socket = useSocket(URL_API_BE);
  const [dataWalletBalance, setDataWalletBalance] = useState<WalletBalanceUSD[]>([]);
  const [loading, setLoading] = useState(false);

  // CALL API SET DEFAULT VALUE FOR MONEY
  const onGetMarketPrice = useCallback(async () => {
    setLoading(true);

    try {
      // Use retry to fetch market price data with automatic retries on failure
      await retry(
        async () => {
          const result = await axios.get(`${URL_API_BE}/crawler/price`);

          // Update the wallet balance data with fetched prices
          const updatedData = defaultRateUSDNotValue.map((item) => {
            const priceData = result.data[item.id];
            return {
              ...item,
              address: item?.address,
              usd: priceData?.usd,
              id: item?.id,
              decimal: priceData?.decimal,
              signature: priceData?.signature,
            };
          });

          // Set the updated data to state
          setDataWalletBalance(updatedData);
        },
        {
          retries: MAX_ATTEMPTS_50, // Maximum number of retries
          delay: 1000, // Delay between retries (1 second)
        }
      );
    } catch (error) {
      console.error('Failed to fetch market price after retries:', error);
      setDataWalletBalance([]); // Set empty data if failure occurs after retries
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  }, []);

  useEffect(() => {
    onGetMarketPrice();
  }, [onGetMarketPrice]);

  const matchDataBalance = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any) => {
      const result = JSON.parse(data);
      const updatedData = dataWalletBalance.map((item) => {
        const priceData = result[item.id];
        return {
          ...item,
          usd: priceData?.usd || '0',
        };
      });
      return updatedData;
    },
    [dataWalletBalance]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasChanged = (oldData: any, newData: any) => {
    return _.some(oldData, (value, key) => {
      const newValue = _.get(newData, [key, 'usd']);
      return value.usd !== newValue;
    });
  };

  useEffect(() => {
    if (socket) {
      const onConnect = () => {
        console.log('Connected to socket server');
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const onEventName = (data: any) => {
        const result = JSON.parse(data);
        if (!walletSocketRef.current) {
          walletSocketRef.current = result;
        } else {
          const check = hasChanged(walletSocketRef.current, result);
          if (check) {
            const res = matchDataBalance(data);
            setDataWalletBalance(res);
            walletSocketRef.current = result;
          }
        }
      };

      const onDisconnect = () => {
        console.log('Disconnected from socket server');
      };

      socket.on('connect', onConnect);
      socket.on('price', onEventName);
      socket.on('disconnect', onDisconnect);

      // Cleanup
      return () => {
        socket.off('connect', onConnect);
        socket.off('price', onEventName);
        socket.off('disconnect', onDisconnect);
      };
    }
  }, [socket, dataWalletBalance, matchDataBalance]);

  return {
    ExchangeRateListUSD: dataWalletBalance,
    loading,
  };
};
