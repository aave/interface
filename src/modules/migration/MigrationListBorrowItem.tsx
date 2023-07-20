import { InterestRate } from '@aave/contract-helpers';
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
      selectedBorrowAssets.findIndex((selectedAsset) =>
        userReserve.interestRate == InterestRate.Stable
          ? selectedAsset.debtKey == userReserve.reserve.stableDebtTokenAddress
          : selectedAsset.debtKey == userReserve.reserve.variableDebtTokenAddress
      ) >= 0
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
