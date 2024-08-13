import axios from 'axios';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import useSocket from 'src/utils/connectSocket';

const URL_PRICE_SOCKET = 'https://aave-ton-api.sotatek.works/';
const URL_DEFAULT_VALUE_PRICE = 'https://aave-ton-api.sotatek.works/crawler/price';
export type WalletBalanceUSD = {
  id: string;
  address: string;
  value: string | number;
};

export const useSocketGetRateUSD = () => {
  const walletSocketRef = useRef(null);
  const socket = useSocket(URL_PRICE_SOCKET);
  // Data with no value price
  const defaultRateUSDNotValue = [
    {
      id: 'dai',
      address: 'EQDPC-_3w_fGyJd-gxxmP8CO_zQC2i3dt-B4D-lNQFwD_YvO',
      value: 1,
    },
    {
      id: 'usd-coin',
      address: 'EQAw6XehcP3V5DEc6uC9F1lUTOLXjElDOpGmNLVZzZPn4E3y',
      value: 1,
    },
    {
      id: 'tether',
      address: 'EQD1h97vd0waJaIsqwYN8BOffL1JJPExBFCrrIgCHDdLeSjO',
      value: 1,
    },
    {
      id: 'ton',
      address: 'EQDOthAmNuoCzB_z_Dz84uutd_dycy98Jpm-3SgpyJnkDgG2',
      value: 1,
    },
  ];

  const [dataWalletBalance, setDataWalletBalance] = useState<WalletBalanceUSD[]>([]);

  // CALL API SET DEFAULT VALUE FOR MONEY
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get(URL_DEFAULT_VALUE_PRICE);

        if (result.data) {
          // Filter and update dataWalletBalance
          const updatedData = defaultRateUSDNotValue.map((item) => {
            const priceData = result.data[item.id];
            return {
              ...item,
              value: priceData ? priceData.usd : 1,
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
            setDataWalletBalance((prevBalances) => {
              return prevBalances.map((balance) => {
                if (result[balance.id] && result[balance.id].usd !== balance.value) {
                  return {
                    ...balance,
                    value: result[balance.id].usd,
                  };
                }
                return balance;
              });
            });
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
  }, [socket]);

  return {
    ExchangeRateListUSD: dataWalletBalance,
  };
};
