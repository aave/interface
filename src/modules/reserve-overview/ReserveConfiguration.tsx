import { AaveV2Ethereum } from '@aave-dao/aave-address-book';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';

import { ReserveBorrowCard } from './ReserveBorrowCard';
import { ReserveInterestRateCard } from './ReserveInterestRateCard';
import { ReserveSupplyCard } from './ReserveSupplyCard';

/**
 * Broken Assets:
 * A list of assets that currently are broken in some way, i.e. has bad data from either the subgraph or backend server
 * Each item represents the ID of the asset, not the underlying address it's deployed to, appended with LendingPoolAddressProvider
 * contract address it is held in. So each item in the array is essentially [underlyingAssetId + LendingPoolAddressProvider address].
 */
const BROKEN_ASSETS = [
  // ampl https://governance.aave.com/t/arc-fix-ui-bugs-in-reserve-overview-for-ampl/5885/5?u=sakulstra
  AaveV2Ethereum.ASSETS.AMPL.UNDERLYING.toLowerCase(),
  AaveV2Ethereum.ASSETS.FEI.UNDERLYING.toLowerCase(),
];

type ReserveConfigurationProps = {
  reserve: ReserveWithId;
};

export const ReserveConfiguration: React.FC<ReserveConfigurationProps> = ({ reserve }) => {
  const renderCharts = !BROKEN_ASSETS.includes(reserve.underlyingToken.address);
  const showBorrowDetails =
    reserve.borrowInfo?.borrowingState === 'ENABLED' ||
    Number(reserve.borrowInfo?.total.amount.value) > 0 ||
    !!reserve.eModeInfo?.some((eMode) => eMode.canBeBorrowed);

  return (
    <>
      <ReserveSupplyCard reserve={reserve} showChart={renderCharts && showBorrowDetails} />
      <ReserveBorrowCard reserve={reserve} showStats={showBorrowDetails} showChart={renderCharts} />
      {showBorrowDetails && <ReserveInterestRateCard reserve={reserve} />}
    </>
  );
};
