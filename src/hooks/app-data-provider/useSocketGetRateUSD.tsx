import axios from 'axios';
import _ from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import useSocket from 'src/utils/connectSocket';

import { address_pools, MAX_ATTEMPTS_50, URL_API_BE } from './useAppDataProviderTon';

export const defaultRateUSDNotValue = [
  {
    id: 'dai',
    address: 'EQDPC-_3w_fGyJd-gxxmP8CO_zQC2i3dt-B4D-lNQFwD_YvO',
    usd: '0',
  },
  {
    id: 'usd-coin',
    address: 'EQAw6XehcP3V5DEc6uC9F1lUTOLXjElDOpGmNLVZzZPn4E3y',
  },
  {
    id: 'tether',
    address: 'EQD1h97vd0waJaIsqwYN8BOffL1JJPExBFCrrIgCHDdLeSjO',
  },
  {
    id: 'the-open-network',
    address: address_pools,
  },
];

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
    let attempts = 0;
    const maxAttempts = MAX_ATTEMPTS_50;
    setLoading(true);
    const fetchData = async () => {
      try {
        attempts++;

        const result = await axios.get(`${URL_API_BE}/crawler/price`);
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
        setDataWalletBalance(updatedData);
      } catch (error) {
        console.error(`Error fetching getBalanceTokenTon (attempt ${attempts}):`, error);
        if (attempts < maxAttempts) {
          console.log('Retrying...getBalanceTokenTon');
          return await fetchData(); // Retry fetching the balance
        } else {
          console.log('Max attempts reached, stopping retries.');
          return '0'; // Return '0' if maximum attempts are reached
        }
      } finally {
        setLoading(false);
      }
    };

    return await fetchData(); // Return the result of fetchData()
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
