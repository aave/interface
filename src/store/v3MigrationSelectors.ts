import { InterestRate } from '@aave/contract-helpers';
import { V3MigrationHelperSignedPermit } from '@aave/contract-helpers/dist/esm/v3-migration-contract/v3MigrationTypes';
import { valueToBigNumber } from '@aave/math-utils';
import { SignatureLike } from '@ethersproject/bytes';
import { BigNumber, BigNumberish, constants } from 'ethers';
import {
  selectUserNonEmtpySummaryAndIncentive,
  selectUserSummaryAndIncentives,
} from './poolSelectors';
import { RootStore } from './root';

export const selectedUserSupplyReservesForMigration = (store: RootStore, timestamp: number) => {
  const user = selectUserNonEmtpySummaryAndIncentive(store, timestamp);
  const selectedUserReserves = user.userReservesData.filter(
    (userReserve) => store.selectedMigrationSupplyAssets[userReserve.underlyingAsset]
  );
  return selectedUserReserves;
};

export const selectUserSupplyIncreasedReservesForMigrationPermits = (
  store: RootStore,
  timestamp: number
) => {
  console.log('selectUserSupplyIncreasedReservesForMigrationPermits')
  return selectedUserSupplyReservesForMigration(store, timestamp).map((userReserve) => {
    const increasedAmount = addPercent(userReserve.underlyingBalance);
    return { ...userReserve, increasedAmount };
  });
};

export const selectUserSupplyAssetsForMigrationNoPermit = (store: RootStore, timestamp: number) => {
  const selectedUserReserves = selectedUserSupplyReservesForMigration(store, timestamp);
  return selectedUserReserves.map(({ underlyingAsset, reserve }) => {
    const deadline = Math.floor(Date.now() / 1000 + 3600);
    return {
      amount: constants.MaxUint256.toString(),
      aToken: reserve.aTokenAddress,
      underlyingAsset: underlyingAsset,
      deadline,
    };
  });
};

export const selectUserSupplyAssetsForMigrationWithPermits = (
  store: RootStore,
  signatures: SignatureLike[],
  deadline: BigNumberish
): V3MigrationHelperSignedPermit[] => {
  return store.approvalPermitsForMigrationAssets.map(({ amount, underlyingAsset }, index) => {
    return {
      signedPermit: signatures[index],
      deadline,
      aToken: underlyingAsset,
      value: amount,
    };
  });
};

const addPercent = (amount: string) => {
  const convertedAmount = valueToBigNumber(amount);
  return convertedAmount.plus(convertedAmount.div(1000)).toString();
};

export const selectUserBorrowReservesForMigration = (store: RootStore, timestamp: number) => {
  const user = selectUserSummaryAndIncentives(store, timestamp);
  const selectedUserReserves = user.userReservesData
    // should filter for empty positions?
    .filter(
      (userReserve) =>
        valueToBigNumber(userReserve.stableBorrows).isGreaterThan(0) ||
        valueToBigNumber(userReserve.variableBorrows).isGreaterThan(0)
    )
    .filter((userReserve) => store.selectedMigrationBorrowAssets[userReserve.underlyingAsset])
    .map(({ reserve, ...userReserve }) => {
      const stableBorrows = valueToBigNumber(userReserve.stableBorrows);
      if (stableBorrows.isGreaterThan(0)) {
        const increasedAmount = addPercent(userReserve.stableBorrows);
        return { ...userReserve, reserve, increasedAmount, interestRate: InterestRate.Stable };
      }
      const increasedAmount = addPercent(userReserve.variableBorrows);
      return { ...userReserve, reserve, increasedAmount, interestRate: InterestRate.Variable };
    });

  return selectedUserReserves;
};

export const selectCurrentMarketV2Reserves = (store: RootStore, timestamp: number) => {
  const currentChainId = store.currentChainId;
  return store.data.get(currentChainId);
};
