import _ from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import useSocket from 'src/utils/connectSocket';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';

export type WalletBalanceUSD = {
  id: string;
  address: string;
  value: string | number;
};

export const useUpdatePriceBalances = (
  URL_PRICE_SOCKET: string,
  //   dataWalletBalance: WalletBalanceUSD[],
  reservesTon: DashboardReserve[],
  setReservesTon: (reserves: DashboardReserve[]) => void
) => {
  const walletSocketRef = useRef(null);
  const socket = useSocket(URL_PRICE_SOCKET);

  const [dataWalletBalance, setDataWalletBalance] = useState<WalletBalanceUSD[]>([
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
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasChanged = (oldData: any, newData: any) => {
    return _.some(oldData, (value, key) => {
      const newValue = _.get(newData, [key, 'usd']);
      return value.usd !== newValue;
    });
  };

  const updateReservesTon = useCallback(() => {
    if (reservesTon && reservesTon.length) {
      let isUpdated = false;
      const resultMappingUsd = reservesTon.map((item) => {
        const dataById = dataWalletBalance.find(
          (subItem) => subItem.address === item?.underlyingAssetTon
        );
        if (dataById) {
          const newWalletBalanceUSD = String(Number(dataById.value) * Number(item.walletBalance));
          if (item.walletBalanceUSD !== newWalletBalanceUSD) {
            isUpdated = true;
            return {
              ...item,
              walletBalanceUSD: newWalletBalanceUSD,
            };
          }
        }
        return item;
      });

      if (isUpdated) {
        setReservesTon(resultMappingUsd as DashboardReserve[]);
      }
    }
  }, [reservesTon, dataWalletBalance, setReservesTon]);

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

  useEffect(() => {
    updateReservesTon();
  }, [reservesTon, dataWalletBalance, updateReservesTon]);

  return {
    ExchangeRateListUSD: dataWalletBalance,
  };
};
