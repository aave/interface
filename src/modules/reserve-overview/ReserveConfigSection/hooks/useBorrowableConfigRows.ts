import { t } from '@lingui/macro';
import { useMemo } from 'react';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';

import {
  ConfigRow,
  STANDARD_CONFIG_KEY,
  toConfigAsset,
  toEModeRow,
  toStandardRow,
} from '../utils/configRows';
import { useMarketConfigReserves } from './useMarketConfigReserves';

export const useBorrowableConfigRows = (reserve: ReserveWithId): ConfigRow[] => {
  const marketReserves = useMarketConfigReserves();
  const standardLabel = t`Standard`;

  return useMemo(() => {
    if (reserve.isFrozen || reserve.isPaused) return [];

    const borrowableInIsolation = !!reserve.isolationModeConfig?.canBeBorrowed;
    const canBackBorrow = (collateral: ReserveWithId) =>
      !collateral.isPaused &&
      (!collateral.isolationModeConfig?.canBeCollateral || borrowableInIsolation);

    const rows: ConfigRow[] = [];

    const borrowingState = reserve.borrowInfo?.borrowingState;
    if (borrowingState && borrowingState !== 'DISABLED') {
      marketReserves.forEach((collateral) => {
        const maxLTV = Number(collateral.supplyInfo.maxLTV.value);
        if (!(maxLTV > 0) || !canBackBorrow(collateral)) return;
        const asset = toConfigAsset(collateral);
        rows.push(
          toStandardRow(collateral, standardLabel, {
            id: `${STANDARD_CONFIG_KEY}-${asset.address}`,
            supplied: Number(collateral.size.usd),
            maxLTV,
            assets: [asset],
          })
        );
      });
    }

    (reserve.eModeInfo ?? [])
      .filter((eMode) => eMode.canBeBorrowed)
      .forEach((eMode) => {
        const maxLTV = Number(eMode.maxLTV.value);
        const collaterals = marketReserves.filter(
          (collateral) =>
            canBackBorrow(collateral) &&
            !!collateral.eModeInfo?.some(
              (info) =>
                info.categoryId === eMode.categoryId && info.canBeCollateral && !info.hasLtvZero
            )
        );
        if (!(maxLTV > 0) || collaterals.length === 0) return;
        rows.push(
          toEModeRow(eMode, {
            maxLTV,
            supplied: collaterals.reduce((sum, collateral) => sum + Number(collateral.size.usd), 0),
            assets: collaterals.map(toConfigAsset),
          })
        );
      });

    return rows;
  }, [reserve, marketReserves, standardLabel]);
};
