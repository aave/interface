import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Button, Stack, Typography } from '@mui/material';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';
import { getEmodeMessage } from 'src/components/transactions/Emode/EmodeNaming';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { WalletEmptyInfo } from 'src/modules/dashboard/lists/SupplyAssetsList/WalletEmptyInfo';
import { useRootStore } from 'src/store/root';
import { assetCanBeBorrowedByUser } from 'src/utils/getMaxAmountAvailableToBorrow';

import { useModalContext } from './useModal';

interface ReserveActionStateProps {
  balance: string;
  maxAmountToSupply: string;
  maxAmountToBorrow: string;
  reserve: ComputedReserveData;
}

export const useReserveActionState = ({
  balance,
  maxAmountToSupply,
  maxAmountToBorrow,
  reserve,
}: ReserveActionStateProps) => {
  const { user, eModes } = useAppDataContext();
  const { supplyCap, borrowCap, debtCeiling } = useAssetCaps();
  const { currentNetworkConfig, currentChainId, currentMarketData } = useRootStore();
  const { openFaucet } = useModalContext();

  const { bridge, name: networkName } = currentNetworkConfig;

  const assetCanBeBorrowedFromPool = assetCanBeBorrowedByUser(reserve, user);
  const userHasNoCollateralSupplied = user?.totalCollateralMarketReferenceCurrency === '0';
  const isolationModeBorrowDisabled = user?.isInIsolationMode && !reserve.borrowableInIsolation;
  const eModeBorrowDisabled =
    user?.isInEmode && reserve.eModeCategoryId !== user.userEmodeCategoryId;

  const POLYGON_DISABLED_ASSETS = ['WETH', 'WMATIC', 'WBTC', 'USDT', 'MATIC'];
  const isPolygonV2 = currentMarketData.chainId === ChainId.polygon && !currentMarketData.v3;
  const isAffectedReserve = isPolygonV2 && POLYGON_DISABLED_ASSETS.includes(reserve.symbol);

  return {
    disableSupplyButton: balance === '0' || maxAmountToSupply === '0' || isAffectedReserve,
    disableBorrowButton:
      !assetCanBeBorrowedFromPool ||
      userHasNoCollateralSupplied ||
      isolationModeBorrowDisabled ||
      eModeBorrowDisabled ||
      maxAmountToBorrow === '0' ||
      isPolygonV2,
    alerts: (
      <Stack gap={3}>
        {balance === '0' && (
          <>
            {currentNetworkConfig.isTestnet ? (
              <Warning sx={{ mb: 0 }} severity="info" icon={false}>
                <Trans>
                  Your {networkName} wallet is empty. Get free test {reserve.name} at
                </Trans>{' '}
                <Button
                  variant="text"
                  sx={{ verticalAlign: 'top' }}
                  onClick={() => openFaucet(reserve.underlyingAsset)}
                  disableRipple
                >
                  <Typography variant="caption">
                    <Trans>{networkName} Faucet</Trans>
                  </Typography>
                </Button>
              </Warning>
            ) : (
              <WalletEmptyInfo
                sx={{ mb: 0 }}
                name={networkName}
                bridge={bridge}
                icon={false}
                chainId={currentChainId}
              />
            )}
          </>
        )}

        {balance !== '0' && user?.totalCollateralMarketReferenceCurrency === '0' && (
          <Warning sx={{ mb: 0 }} severity="info" icon={false}>
            <Trans>To borrow you need to supply any asset to be used as collateral.</Trans>
          </Warning>
        )}

        {isolationModeBorrowDisabled && (
          <Warning sx={{ mb: 0 }} severity="warning" icon={false}>
            <Trans>Collateral usage is limited because of Isolation mode.</Trans>
          </Warning>
        )}

        {eModeBorrowDisabled && isolationModeBorrowDisabled && (
          <Warning sx={{ mb: 0 }} severity="info" icon={false}>
            <Trans>
              Borrowing is unavailable because you’ve enabled Efficiency Mode (E-Mode) and Isolation
              mode. To manage E-Mode and Isolation mode visit your{' '}
              <Link href={ROUTES.dashboard}>Dashboard</Link>.
            </Trans>
          </Warning>
        )}

        {eModeBorrowDisabled && !isolationModeBorrowDisabled && (
          <Warning sx={{ mb: 0 }} severity="info" icon={false}>
            <Trans>
              Borrowing is unavailable because you’ve enabled Efficiency Mode (E-Mode) for{' '}
              {getEmodeMessage(eModes[user.userEmodeCategoryId].label)} category. To manage E-Mode
              categories visit your <Link href={ROUTES.dashboard}>Dashboard</Link>.
            </Trans>
          </Warning>
        )}

        {!eModeBorrowDisabled && isolationModeBorrowDisabled && (
          <Warning sx={{ mb: 0 }} severity="info" icon={false}>
            <Trans>
              Borrowing is unavailable because you’re using Isolation mode. To manage Isolation mode
              visit your <Link href={ROUTES.dashboard}>Dashboard</Link>.
            </Trans>
          </Warning>
        )}

        {maxAmountToSupply === '0' &&
          supplyCap.determineWarningDisplay({ supplyCap, icon: false, sx: { mb: 0 } })}
        {maxAmountToBorrow === '0' &&
          borrowCap.determineWarningDisplay({ borrowCap, icon: false, sx: { mb: 0 } })}
        {reserve.isIsolated &&
          balance !== '0' &&
          user?.totalCollateralUSD !== '0' &&
          debtCeiling.determineWarningDisplay({ debtCeiling, icon: false, sx: { mb: 0 } })}
      </Stack>
    ),
  };
};
