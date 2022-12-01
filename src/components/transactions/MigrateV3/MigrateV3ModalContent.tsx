import { Trans } from '@lingui/macro';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useUserReserves } from 'src/hooks/useUserReserves';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { MigrateV3Actions } from './MigrateV3Actions';
import { MigrateV3ModalAssetsList } from './MigrateV3ModalAssetsList';

export const MigrateV3ModalContent = () => {
  const {
    selectedMigrationSupplyAssets: selectedSupplyAssets,
    selectedMigrationBorrowAssets: selectedBorrowAssets,
  } = useRootStore();

  const { user, borrowPositions } = useUserReserves();

  const { gasLimit, mainTxState: migrateTxState, txError } = useModalContext();
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId, watchModeOnlyAddress } = useWeb3Context();
  const networkConfig = getNetworkConfig(currentChainId);

  const supplyAssets = Object.keys(selectedSupplyAssets).map((asset) => {
    const reserve = user.userReservesData.find(
      (reserve) => reserve.underlyingAsset.toLowerCase() === asset.toLowerCase()
    );

    if (reserve) {
      return {
        underlyingAsset: asset,
        iconSymbol: reserve.reserve.iconSymbol,
        symbol: reserve.reserve.symbol,
        amount: reserve.underlyingBalance,
        amountInUSD: reserve.underlyingBalanceUSD,
      };
    }
  });

  const borrowsAssets = Object.keys(selectedBorrowAssets).map((asset) => {
    const reserve = borrowPositions.find(
      (reserve) => reserve.underlyingAsset.toLowerCase() === asset.toLowerCase()
    );

    if (reserve) {
      return {
        underlyingAsset: asset,
        iconSymbol: reserve.reserve.iconSymbol,
        symbol: reserve.reserve.symbol,
        amount: reserve.totalBorrows,
        amountInUSD: reserve.totalBorrowsUSD,
      };
    }
  });

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (migrateTxState.success) return <TxSuccessView action={<Trans>Migrated</Trans>} />;

  return (
    <>
      <TxModalTitle title="Migrate to V3" />
      {isWrongNetwork && !watchModeOnlyAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
      )}

      <TxModalDetails gasLimit={gasLimit}>
        <MigrateV3ModalAssetsList
          caption={<Trans>Selected supply assets</Trans>}
          assets={supplyAssets}
        />
        <MigrateV3ModalAssetsList
          caption={<Trans>Selected borrow assets</Trans>}
          assets={borrowsAssets}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <MigrateV3Actions isWrongNetwork={isWrongNetwork} blocked={false} />
    </>
  );
};
