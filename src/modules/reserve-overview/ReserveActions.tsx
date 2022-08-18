import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { ReactNode } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useModalContext } from 'src/hooks/useModal';
import { usePermissions } from 'src/hooks/usePermissions';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import {
  assetCanBeBorrowedByUser,
  getMaxAmountAvailableToBorrow,
} from 'src/utils/getMaxAmountAvailableToBorrow';
import { getMaxAmountAvailableToSupply } from 'src/utils/getMaxAmountAvailableToSupply';
import { CapType } from '../../components/caps/helper';
import { AvailableTooltip } from '../../components/infoTooltips/AvailableTooltip';
import { Row } from '../../components/primitives/Row';
import { Link, ROUTES } from '../../components/primitives/Link';
import { getEmodeMessage } from '../../components/transactions/Emode/EmodeNaming';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { Warning } from 'src/components/primitives/Warning';
import { HarmonyWarning } from 'src/components/transactions/Warnings/HarmonyWarning';
import { useAssetCaps } from 'src/hooks/useAssetCaps';

const PaperWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Paper sx={{ pt: 4, pb: { xs: 4, xsm: 6 }, px: { xs: 4, xsm: 6 } }}>
      <Typography variant="h3" sx={{ mb: { xs: 6, xsm: 10 } }}>
        <Trans>Your info</Trans>
      </Typography>

      {children}
    </Paper>
  );
};

interface ReserveActionsProps {
  underlyingAsset: string;
}

export const ReserveActions = ({ underlyingAsset }: ReserveActionsProps) => {
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const { openBorrow, openFaucet, openSupply } = useModalContext();
  const { currentAccount, loading: web3Loading } = useWeb3Context();
  const { user, reserves, loading: loadingReserves } = useAppDataContext();
  const { walletBalances, loading: loadingBalance } = useWalletBalances();
  const { isPermissionsLoading } = usePermissions();
  const { currentNetworkConfig } = useProtocolDataContext();
  const { bridge, name: networkName } = currentNetworkConfig;
  const { supplyCap, borrowCap, debtCeiling } = useAssetCaps();

  if (!currentAccount && !isPermissionsLoading)
    return (
      <Paper sx={{ pt: 4, pb: { xs: 4, xsm: 6 }, px: { xs: 4, xsm: 6 } }}>
        {web3Loading ? (
          <CircularProgress />
        ) : (
          <>
            <Typography variant="h3" sx={{ mb: { xs: 6, xsm: 10 } }}>
              <Trans>Your info</Trans>
            </Typography>
            <Typography sx={{ mb: 6 }} color="text.secondary">
              <Trans>Please connect a wallet to view your personal information here.</Trans>
            </Typography>
            <ConnectWalletButton />
          </>
        )}
      </Paper>
    );

  if (loadingReserves || loadingBalance)
    return (
      <PaperWrapper>
        <Row
          caption={<Skeleton width={100} height={20} />}
          align="flex-start"
          mb={6}
          captionVariant="description"
        >
          <Skeleton width={70} height={20} />
        </Row>

        <Row caption={<Skeleton width={100} height={20} />} mb={3}>
          <Skeleton width={70} height={20} />
        </Row>

        <Row caption={<Skeleton width={100} height={20} />} mb={10}>
          <Skeleton width={70} height={20} />
        </Row>

        <Stack direction="row" spacing={2}>
          <Skeleton width={downToXSM ? '100%' : 70} height={36} />
          <Skeleton width={downToXSM ? '100%' : 70} height={36} />
        </Stack>
      </PaperWrapper>
    );

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  const balance = walletBalances[underlyingAsset];
  const canBorrow = assetCanBeBorrowedByUser(poolReserve, user);
  const maxAmountToBorrow = getMaxAmountAvailableToBorrow(
    poolReserve,
    user,
    InterestRate.Variable
  ).toString();
  const maxAmountToSupply = getMaxAmountAvailableToSupply(
    balance.amount,
    poolReserve,
    underlyingAsset
  ).toString();

  const isolationModeBorrowDisabled = user?.isInIsolationMode && !poolReserve.borrowableInIsolation;
  const eModeBorrowDisabled =
    user?.isInEmode && poolReserve.eModeCategoryId !== user.userEmodeCategoryId;

  // Remove all supply/borrow elements and display warning message instead for frozen reserves
  if (poolReserve.isFrozen) {
    return (
      <PaperWrapper>
        {balance?.amount !== '0' && (
          <Row
            caption={<Trans>Wallet balance</Trans>}
            align="flex-start"
            mb={6}
            captionVariant="description"
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <FormattedNumber
                value={balance?.amount || 0}
                variant="secondary14"
                symbol={poolReserve.symbol}
              />
              <FormattedNumber
                value={balance?.amountUSD || '0'}
                variant="helperText"
                color="text.muted"
                symbolsColor="text.muted"
                symbol="USD"
              />
            </Box>
          </Row>
        )}
        <Warning sx={{ mb: '12px' }} severity="error" icon={true}>
          <Trans>
            Since this asset is frozen, the only available actions are withdraw and repay which can
            be accessed from the <Link href={ROUTES.dashboard}>Dashboard</Link>
          </Trans>
        </Warning>
      </PaperWrapper>
    );
  }

  return (
    <PaperWrapper>
      {balance?.amount === '0' && (
        <Row align="flex-start">
          {currentNetworkConfig.isTestnet ? (
            <Warning severity="info" icon={false}>
              <Trans>
                Your {networkName} wallet is empty. Get free test {poolReserve.name} at
              </Trans>{' '}
              <Button
                variant="text"
                sx={{ verticalAlign: 'top' }}
                onClick={() => openFaucet(underlyingAsset)}
                disableRipple
              >
                <Typography variant="caption">
                  <Trans>{networkName} Faucet</Trans>
                </Typography>
              </Button>
            </Warning>
          ) : (
            <Warning severity="info" icon={false}>
              <Trans>Your {networkName} wallet is empty. Purchase or transfer assets</Trans>{' '}
              {bridge && (
                <Trans>
                  or use {<Link href={bridge.url}>{bridge.name}</Link>} to transfer your ETH assets.
                </Trans>
              )}
            </Warning>
          )}
        </Row>
      )}
      <Row
        caption={<Trans>Wallet balance</Trans>}
        align="flex-start"
        mb={6}
        captionVariant="description"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <FormattedNumber
            value={balance?.amount || 0}
            variant="secondary14"
            symbol={poolReserve.symbol}
          />
          <FormattedNumber
            value={balance?.amountUSD || '0'}
            variant="helperText"
            color="text.muted"
            symbolsColor="text.muted"
            symbol="USD"
          />
        </Box>
      </Row>

      <Row
        caption={
          <AvailableTooltip
            variant="description"
            text={<Trans>Available to supply</Trans>}
            capType={CapType.supplyCap}
          />
        }
        mb={3}
      >
        <FormattedNumber
          value={maxAmountToSupply}
          variant="secondary14"
          symbol={poolReserve.symbol}
        />
      </Row>

      <Row
        caption={
          <AvailableTooltip
            variant="description"
            text={<Trans>Available to borrow</Trans>}
            capType={CapType.borrowCap}
          />
        }
        mb={3}
      >
        {canBorrow ? (
          <FormattedNumber
            value={canBorrow ? maxAmountToBorrow : '0'}
            variant="secondary14"
            symbol={poolReserve.symbol}
          />
        ) : (
          <Typography variant="secondary14" color="text.secondary">
            <Trans>Unavailable</Trans>
          </Typography>
        )}
      </Row>

      {balance?.amount !== '0' && user?.totalCollateralMarketReferenceCurrency === '0' && (
        <Warning sx={{ mb: '12px' }} severity="info" icon={false}>
          <Trans>To borrow you need to supply any asset to be used as collateral.</Trans>
        </Warning>
      )}

      {isolationModeBorrowDisabled && (
        <Warning sx={{ mb: '12px' }} severity="warning" icon={false}>
          <Trans>Collateral usage is limited because of Isolation mode.</Trans>
        </Warning>
      )}

      {eModeBorrowDisabled && isolationModeBorrowDisabled && (
        <Warning sx={{ mb: '12px' }} severity="info" icon={false}>
          <Trans>
            Borrowing is unavailable because you’ve enabled Efficiency Mode (E-Mode) and Isolation
            mode. To manage E-Mode and Isolation mode visit your{' '}
            <Link href={ROUTES.dashboard}>Dashboard</Link>.
          </Trans>
        </Warning>
      )}

      {eModeBorrowDisabled && !isolationModeBorrowDisabled && (
        <Warning sx={{ mb: '12px' }} severity="info" icon={false}>
          <Trans>
            Borrowing is unavailable because you’ve enabled Efficiency Mode (E-Mode) for{' '}
            {getEmodeMessage(user.userEmodeCategoryId, currentNetworkConfig.baseAssetSymbol)}{' '}
            category. To manage E-Mode categories visit your{' '}
            <Link href={ROUTES.dashboard}>Dashboard</Link>.
          </Trans>
        </Warning>
      )}

      {!eModeBorrowDisabled && isolationModeBorrowDisabled && (
        <Warning sx={{ mb: '12px' }} severity="info" icon={false}>
          <Trans>
            Borrowing is unavailable because you’re using Isolation mode. To manage Isolation mode
            visit your <Link href={ROUTES.dashboard}>Dashboard</Link>.
          </Trans>
        </Warning>
      )}

      <Row mb={3} />

      {currentNetworkConfig.name === 'Harmony' && (
        <Row align="flex-start" mb={3}>
          <HarmonyWarning learnMore={true} />
        </Row>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button
          variant="contained"
          disabled={balance?.amount === '0'}
          onClick={() => openSupply(underlyingAsset)}
          fullWidth={downToXSM}
        >
          <Trans>Supply</Trans> {downToXSM && poolReserve.symbol}
        </Button>
        <Button
          disabled={!canBorrow || user?.totalCollateralMarketReferenceCurrency === '0'}
          variant="contained"
          onClick={() => openBorrow(underlyingAsset)}
          fullWidth={downToXSM}
        >
          <Trans>Borrow</Trans> {downToXSM && poolReserve.symbol}
        </Button>
      </Stack>
      {maxAmountToSupply === '0' && supplyCap.determineWarningDisplay({ supplyCap, icon: false })}
      {maxAmountToBorrow === '0' && borrowCap.determineWarningDisplay({ borrowCap, icon: false })}
      {poolReserve.isIsolated &&
        balance?.amount !== '0' &&
        user?.totalCollateralMarketReferenceCurrency !== '0' &&
        debtCeiling.determineWarningDisplay({ debtCeiling, icon: false })}
    </PaperWrapper>
  );
};
