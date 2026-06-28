import { useMemo } from 'react';
import { MigrationUserReserve, V3Rates } from 'src/store/v3MigrationSelectors';
import { MigrationSelectedBorrowAsset } from 'src/store/v3MigrationSlice';

import { MigrationListItem } from './MigrationListItem';

type MigrationListBorrowItemProps = {
  userReserve: MigrationUserReserve;
  selectedBorrowAssets: MigrationSelectedBorrowAsset[];
  toggleSelectedBorrowPosition: (asset: MigrationSelectedBorrowAsset) => void;
  v3Rates?: V3Rates;
  enteringIsolation: boolean;
};

export const MigrationListBorrowItem = ({
  selectedBorrowAssets,
  userReserve,
  toggleSelectedBorrowPosition,
  v3Rates,
  enteringIsolation,
}: MigrationListBorrowItemProps) => {
  const isChecked = useMemo(() => {
    return (
      !userReserve.migrationDisabled &&
      selectedBorrowAssets.findIndex(
        (selectedAsset) => selectedAsset.debtKey === userReserve.reserve.variableDebtTokenAddress
      ) >= 0
    );
  }, [
    selectedBorrowAssets,
    userReserve.migrationDisabled,
    userReserve.reserve.variableDebtTokenAddress,
  ]);

  const handleCheckboxClick = () => {
    toggleSelectedBorrowPosition(userReserve);
  };

  const amount = userReserve.variableBorrows;
  const amountInUSD = userReserve.variableBorrowsUSD;

  return (
    <MigrationListItem
      key={userReserve.debtKey}
      checked={isChecked}
      userReserve={userReserve}
      amount={amount}
      amountInUSD={amountInUSD}
      onCheckboxClick={handleCheckboxClick}
      disabled={userReserve.migrationDisabled}
      enabledAsCollateral={userReserve.usageAsCollateralEnabledOnUser}
      borrowApyType={userReserve.interestRate}
      v3Rates={v3Rates}
      enteringIsolation={enteringIsolation}
      isSupplyList={false}
    />
  );
};
