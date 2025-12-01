import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Button, Stack, SvgIcon, Typography } from '@mui/material';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';
import { ReserveWithId, useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { WalletEmptyInfo } from 'src/modules/dashboard/lists/SupplyAssetsList/WalletEmptyInfo';
import { useRootStore } from 'src/store/root';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';
import { useShallow } from 'zustand/shallow';

import { useAssetCapsSDK } from './useAssetCapsSDK';
import { useModalContext } from './useModal';

interface ReserveActionStateProps {
  balance: string;
  maxAmountToSupply: string;
  maxAmountToBorrow: string;
  reserve: ReserveWithId;
}

export const useReserveActionState = ({
  balance,
  maxAmountToSupply,
  maxAmountToBorrow,
  reserve,
}: ReserveActionStateProps) => {
  const { userState } = useAppDataContext();
  const { supplyCap, borrowCap, debtCeiling } = useAssetCapsSDK();
  const [currentMarket, currentNetworkConfig, currentChainId, currentMarketData] = useRootStore(
    useShallow((store) => [
      store.currentMarket,
      store.currentNetworkConfig,
      store.currentChainId,
      store.currentMarketData,
    ])
  );
  const { openFaucet } = useModalContext();

  const { bridge, name: networkName } = currentNetworkConfig;

  const assetCanBeBorrowedFromPool =
    !!reserve.userState?.canBeBorrowed &&
    reserve.borrowInfo?.borrowingState !== 'DISABLED' &&
    !reserve.isPaused &&
    !reserve.isFrozen;
  const userHasNoCollateralSupplied = !userState || userState.totalCollateralBase === '0';
  const isolationModeBorrowDisabled =
    !!userState?.isInIsolationMode && reserve.isolationModeConfig?.canBeBorrowed === false;
  const eModeBorrowDisabled =
    !!userState?.eModeEnabled &&
    (reserve.userState?.emode?.canBeBorrowed === false || reserve.userState?.emode == null);

  const isGho = displayGhoForMintableMarket({
    symbol: reserve.underlyingToken.symbol,
    currentMarket,
  });
  const eModeLabel = reserve.userState?.emode?.label ?? 'Disabled';
  return {
    disableSupplyButton: balance === '0' || maxAmountToSupply === '0' || isGho,
    disableBorrowButton:
      !assetCanBeBorrowedFromPool ||
      userHasNoCollateralSupplied ||
      isolationModeBorrowDisabled ||
      eModeBorrowDisabled ||
      maxAmountToBorrow === '0',
    alerts: (
      <Stack gap={3}>
        {balance === '0' && !isGho && (
          <>
            {currentNetworkConfig.isTestnet ? (
              <Warning sx={{ mb: 0 }} severity="info" icon={false}>
                <Trans>
                  Your {networkName} wallet is empty. Get free test {reserve.underlyingToken.name}{' '}
                  at
                </Trans>{' '}
                {!currentMarketData.addresses.FAUCET ? (
                  <Button
                    variant="text"
                    href="https://faucet.circle.com/"
                    component={Link}
                    sx={{ verticalAlign: 'top' }}
                    disableRipple
                    endIcon={
                      <SvgIcon sx={{ width: 14, height: 14 }}>
                        <ExternalLinkIcon />
                      </SvgIcon>
                    }
                  >
                    <Typography variant="caption">
                      <Trans>{networkName} Faucet</Trans>
                    </Typography>
                  </Button>
                ) : (
                  <Button
                    variant="text"
                    sx={{ verticalAlign: 'top' }}
                    onClick={() => openFaucet(reserve.underlyingToken.address)}
                    disableRipple
                  >
                    <Typography variant="caption">
                      <Trans>{networkName} Faucet</Trans>
                    </Typography>
                  </Button>
                )}
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

        {(balance !== '0' || isGho) && userState?.totalCollateralBase === '0' && (
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
              {eModeLabel} category. To manage E-Mode categories visit your{' '}
              <Link href={ROUTES.dashboard}>Dashboard</Link>.
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
          supplyCap?.determineWarningDisplay({ supplyCap, icon: false, sx: { mb: 0 } })}
        {maxAmountToBorrow === '0' &&
          borrowCap?.determineWarningDisplay({ borrowCap, icon: false, sx: { mb: 0 } })}
        {reserve.isolationModeConfig?.canBeCollateral === true &&
          balance !== '0' &&
          userState?.totalCollateralBase !== '0' &&
          debtCeiling?.determineWarningDisplay({ debtCeiling, icon: false, sx: { mb: 0 } })}
      </Stack>
    ),
  };
};
