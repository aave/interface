import axios from 'axios';
import _ from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import useSocket from 'src/utils/connectSocket';

const URL_PRICE_SOCKET = 'https://aave-ton-api.sotatek.works/';
const URL_DEFAULT_VALUE_PRICE = 'https://aave-ton-api.sotatek.works/crawler/price';

export type WalletBalanceUSD = {
  id: string;
  address: string;
  usd: string;
  decimal: number;
  signature: string;
};

export const useSocketGetRateUSD = () => {
  const walletSocketRef = useRef(null);
  const socket = useSocket(URL_PRICE_SOCKET);
  // Data with no value price
  const defaultRateUSDNotValue = [
    {
      id: 'dai',
      address: 'EQDPC-_3w_fGyJd-gxxmP8CO_zQC2i3dt-B4D-lNQFwD_YvO',
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
      address: 'EQBUpTYY_OWdLT2LEYJSx85wevYdSMKFNTmSmcZ0f24TixcN',
    },
  ];

  const [dataWalletBalance, setDataWalletBalance] = useState<WalletBalanceUSD[]>([]);

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

  // CALL API SET DEFAULT VALUE FOR MONEY
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get(URL_DEFAULT_VALUE_PRICE);

        if (result.data) {
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
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

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
            console.log('socket-price-------------------: ', res);
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
  };
};
