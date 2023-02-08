import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { useCallback } from 'react';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import {
  selectedUserSupplyReservesForMigration,
  selectSelectedBorrowReservesForMigrationV3,
} from 'src/store/v3MigrationSelectors';
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
  const currentTimeStamp = useCurrentTimestamp(10);
  const { supplyPositions, borrowPositions } = useRootStore(
    useCallback(
      (state) => ({
        supplyPositions: selectedUserSupplyReservesForMigration(state, currentTimeStamp),
        borrowPositions: selectSelectedBorrowReservesForMigrationV3(state, currentTimeStamp),
      }),
      [currentTimeStamp]
    )
  );

  const { gasLimit, mainTxState: migrateTxState, txError } = useModalContext();
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const networkConfig = getNetworkConfig(currentChainId);

  const supplyAssets = supplyPositions.map((supplyAsset) => {
    return {
      underlyingAsset: supplyAsset.underlyingAsset,
      iconSymbol: supplyAsset.reserve.iconSymbol,
      symbol: supplyAsset.reserve.symbol,
      amount: supplyAsset.underlyingBalance,
      amountInUSD: supplyAsset.underlyingBalanceUSD,
    };
  });

  const borrowsAssets = borrowPositions.map((asset) => {
    return {
      underlyingAsset: asset.debtKey,
      iconSymbol: asset.reserve.iconSymbol,
      symbol: asset.reserve.symbol,
      amount:
        asset.interestRate == InterestRate.Stable ? asset.stableBorrows : asset.variableBorrows,
      amountInUSD:
        asset.interestRate == InterestRate.Stable
          ? asset.stableBorrowsUSD
          : asset.variableBorrowsUSD,
    };
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
      {isWrongNetwork && !readOnlyModeAddress && (
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
