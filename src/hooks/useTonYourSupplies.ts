import { Address, toNano } from '@ton/core';
import { formatUnits } from 'ethers/lib/utils';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { Pool } from 'src/contracts/Pool';
import { User } from 'src/contracts/User';
import { ExtendedFormattedUser } from 'src/hooks/pool/useExtendedUserSummaryAndIncentives';
import { calculateTotalElementTon } from 'src/utils/calculatesTon';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';

import { address_pools } from './app-data-provider/useAppDataProviderTon';
import { WalletBalanceUSD } from './app-data-provider/useSocketGetRateUSD';
import { useTonClient } from './useTonClient';
import { useTonConnect } from './useTonConnect';
import { useTonGetTxByBOC } from './useTonGetTxByBOC';

interface UseTransactionHandlerTonProps {
  yourAddressWallet: string;
}

export const useTonYourSupplies = (
  yourAddressWallet: string,
  reserves: DashboardReserve[],
  ExchangeRateListUSD: WalletBalanceUSD[]
) => {
  const client = useTonClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [userSummaryTon, setUserSummaryTon] = useState<ExtendedFormattedUser>();
  const [yourSuppliesTon, setYourSuppliesTon] = useState<unknown>([]);

  const onGetYourSupply = useCallback(async () => {
    if (!client || !address_pools || !yourAddressWallet) return;
    const poolContract = client.open(Pool.createFromAddress(Address.parse(address_pools)));
    const res = await poolContract.getUserSupplies(Address.parse(yourAddressWallet));
    return res;
  }, [client, yourAddressWallet]);

  const getYourSupplies = useCallback(async () => {
    setLoading(true);

    try {
      if (!client || !address_pools || !yourAddressWallet || !reserves) {
        return;
      }

      const yourSupplies = await onGetYourSupply();

      const result = await Promise.all(
        _.chain(reserves)
          .filter((reserve) =>
            _.some(
              yourSupplies,
              (yourSupply) =>
                reserve.poolJettonWalletAddress === yourSupply.underlyingAddress.toString() &&
                Number(yourSupply.supplyBalance) > 0
            )
          )
          .map(async (reserve) => {
            const matchedSupply = _.find(
              yourSupplies,
              (yourSupply) =>
                reserve.poolJettonWalletAddress === yourSupply.underlyingAddress.toString()
            );
            return {
              ...reserve,
              underlyingBalance: formatUnits(matchedSupply?.supplyBalance || '0', reserve.decimals),
              underlyingBalanceUSD: formatUnits(
                matchedSupply?.supplyBalance || '0',
                reserve.decimals
              ),
              usageAsCollateralEnabledOnUser: matchedSupply?.isCollateral,
              reserveID: matchedSupply?.underlyingAddress,
              // usageAsCollateralEnabledOnUser: matchedSupply?.isCollateral,
              // reserveID: matchedSupply?.reserveID,
            };
          })
          .value()
      );

      setYourSuppliesTon(result);
    } catch (error) {
      console.error('Error fetching supplies:', error);
    } finally {
      setLoading(false);
    }
  }, [client, yourAddressWallet, reserves, onGetYourSupply]);

  useEffect(() => {
    getYourSupplies();
  }, [client, onGetYourSupply, yourAddressWallet, reserves, getYourSupplies]);

  const updateRealTimeBalanceUSD = useCallback(
    (data: unknown) => {
      try {
        if (!data || !ExchangeRateListUSD) return [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = _.map(data, (asset: any) => {
          const match = _.find(ExchangeRateListUSD, { address: asset?.underlyingAssetTon });
          if (match) {
            return {
              ...asset,
              underlyingBalanceUSD:
                (Number(match?.value) || 0) * (Number(asset.underlyingBalance) || 0),
            };
          }
          return asset;
        });

        return result;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    [ExchangeRateListUSD]
  );

  useEffect(() => {
    const dataUpdate = updateRealTimeBalanceUSD(yourSuppliesTon);

    const totalLiquidityUSD = calculateTotalElementTon(dataUpdate, 'underlyingBalanceUSD');

    const earnedAPY = calculateTotalElementTon(dataUpdate, 'supplyAPY');

    const res = {
      userReservesData: dataUpdate,
      totalLiquidityMarketReferenceCurrency: '111',
      totalLiquidityUSD: String(totalLiquidityUSD) || '0',
      totalCollateralMarketReferenceCurrency: '113',
      totalCollateralUSD: '114',
      totalBorrowsMarketReferenceCurrency: '115',
      totalBorrowsUSD: '116',
      netWorthUSD: '117',
      availableBorrowsMarketReferenceCurrency: '118',
      availableBorrowsUSD: '119',
      currentLoanToValue: '120',
      currentLiquidationThreshold: '121',
      healthFactor: '122',
      isInIsolationMode: false,
      calculatedUserIncentives: {},
      userEmodeCategoryId: 0,
      isInEmode: false,
      earnedAPY: earnedAPY,
      debtAPY: 1,
      netAPY: 2,
    };
    setUserSummaryTon(res as ExtendedFormattedUser);
  }, [yourSuppliesTon, ExchangeRateListUSD, updateRealTimeBalanceUSD]);

  return {
    yourSuppliesTon,
    getYourSupplies,
    loading,
    userSummaryTon,
  };
};

export const useTonCollateral = ({ yourAddressWallet }: UseTransactionHandlerTonProps) => {
  const client = useTonClient();
  const { onGetGetTxByBOC } = useTonGetTxByBOC();
  const { sender, getLatestBoc } = useTonConnect();

  const onToggleCollateralTon = useCallback(
    async (reserveId: string, status: boolean) => {
      if (!client || !yourAddressWallet || !address_pools) {
        return;
      }
      const poolContract = client.open(Pool.createFromAddress(Address.parse(address_pools)));
      const userContractAddress = await poolContract.getUserAddress(
        Address.parse(yourAddressWallet)
      );

      const collateralContract = client.open(User.createFromAddress(userContractAddress));
      try {
        await collateralContract.sendUpdateColleteral(
          sender, //via: Sender,
          toNano('0.1'), // gas 0.1
          Address.parse(reserveId), // reserveID
          status // true = isCollateral, false = unCollateral
        );

        const boc = await getLatestBoc();
        const txHash = await onGetGetTxByBOC(boc, yourAddressWallet);
        if (txHash) {
          return { success: true, txHash: txHash };
        }
      } catch (error) {
        console.error('Transaction failed:', error);
        return { success: false, error };
      }
    },
    [client, getLatestBoc, onGetGetTxByBOC, sender, yourAddressWallet]
  );

  return {
    onToggleCollateralTon,
  };
};
