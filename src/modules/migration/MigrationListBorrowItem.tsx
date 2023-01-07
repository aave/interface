import { InterestRate } from '@aave/contract-helpers';
import { useMemo } from 'react';
import { SplittedUserReserveIncreasedAmount } from 'src/store/v3MigrationSelectors';
import { MigrationSelectedBorrowAsset } from 'src/store/v3MigrationSlice';

import { MigrationListItem } from './MigrationListItem';

type MigrationListBorrowItemProps = {
  userReserve: SplittedUserReserveIncreasedAmount & {
    disabledForMigration: boolean;
  };
  selectedBorrowAssets: MigrationSelectedBorrowAsset[];
  toggleSelectedBorrowPosition: (asset: MigrationSelectedBorrowAsset) => void;
};

export const MigrationListBorrowItem = ({
  selectedBorrowAssets,
  userReserve,
  toggleSelectedBorrowPosition,
}: MigrationListBorrowItemProps) => {
  const isChecked = useMemo(() => {
    return (
      !userReserve.disabledForMigration &&
      selectedBorrowAssets.findIndex((selectedAsset) =>
        userReserve.interestRate == InterestRate.Stable
          ? selectedAsset.debtKey == userReserve.reserve.stableDebtTokenAddress
          : selectedAsset.debtKey == userReserve.reserve.variableDebtTokenAddress
      ) >= 0
    );
  }, [selectedBorrowAssets]);

  const handleCheckboxClick = () => {
    toggleSelectedBorrowPosition(userReserve);
  };

  const amount =
    userReserve.interestRate == InterestRate.Stable
      ? userReserve.stableBorrows
      : userReserve.variableBorrows;

  const amountInUSD =
    userReserve.interestRate == InterestRate.Stable
      ? userReserve.stableBorrowsUSD
      : userReserve.variableBorrowsUSD;

  return (
    <MigrationListItem
      key={userReserve.debtKey}
      checked={isChecked}
      reserveIconSymbol={userReserve.reserve.iconSymbol}
      reserveName={userReserve.reserve.name}
      reserveSymbol={userReserve.reserve.symbol}
      amount={amount}
      amountInUSD={amountInUSD}
      onCheckboxClick={handleCheckboxClick}
      disabled={userReserve.disabledForMigration}
      enabledAsCollateral={userReserve.usageAsCollateralEnabledOnUser}
    />
  );
};
