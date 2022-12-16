import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { ReactNode, useState } from 'react';
import { getMarketInfoById } from 'src/components/MarketSwitcher';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Warning } from 'src/components/primitives/Warning';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import { MarketWarning } from 'src/components/transactions/Warnings/MarketWarning';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import {
  ComputedReserveData,
  ExtendedFormattedUser,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { usePermissions } from 'src/hooks/usePermissions';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { BuyWithFiat } from 'src/modules/staking/BuyWithFiat';
import {
  assetCanBeBorrowedByUser,
  getMaxAmountAvailableToBorrow,
} from 'src/utils/getMaxAmountAvailableToBorrow';
import { getMaxAmountAvailableToSupply } from 'src/utils/getMaxAmountAvailableToSupply';

import { CapType } from '../../components/caps/helper';
import { AvailableTooltip } from '../../components/infoTooltips/AvailableTooltip';
import { Link, ROUTES } from '../../components/primitives/Link';
import { Row } from '../../components/primitives/Row';
import { getEmodeMessage } from '../../components/transactions/Emode/EmodeNaming';
import { WalletEmptyInfo } from '../dashboard/lists/SupplyAssetsList/WalletEmptyInfo';

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

interface NewReserveActionsProps {
  reserve: ComputedReserveData;
}

export const NewReserveActions = ({ reserve }: NewReserveActionsProps) => {
  const [selectedAsset, setSelectedAsset] = useState<string>(reserve.symbol);
  const { openBorrow, openSupply } = useModalContext();

  const { currentMarket, currentNetworkConfig } = useProtocolDataContext();
  const { user } = useAppDataContext();
  const {
    market: { marketTitle },
  } = getMarketInfoById(currentMarket);

  const { walletBalances } = useWalletBalances();
  const balance = walletBalances[reserve.underlyingAsset];

  const { baseAssetSymbol } = currentNetworkConfig;

  const maxAmountToBorrow = getMaxAmountAvailableToBorrow(
    reserve,
    user,
    InterestRate.Variable
  ).toString();

  const maxAmountToSupply = getMaxAmountAvailableToSupply(
    balance.amount,
    reserve,
    reserve.underlyingAsset
  ).toString();

  const disableBorrowButton =
    balance?.amount !== '0' && user?.totalCollateralMarketReferenceCurrency === '0';

  return (
    <PaperWrapper>
      {reserve.isWrappedBaseAsset && (
        <Box>
          <WrappedBaseAssetSelector
            assetSymbol={reserve.symbol}
            baseAssetSymbol={baseAssetSymbol}
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
          />
        </Box>
      )}
      <WalletBalance balance={balance.amount} symbol={reserve.symbol} marketTitle={marketTitle} />
      {reserve.isFrozen ? (
        <Box sx={{ mt: 3 }}>
          <FrozenWarning />
        </Box>
      ) : (
        <>
          <Divider sx={{ my: 8 }} />
          <Box>
            <Stack gap={3}>
              <SupplyAction
                value={maxAmountToSupply}
                symbol={selectedAsset}
                disable={balance?.amount === '0'}
                onActionClicked={() => openSupply(reserve.underlyingAsset)}
              />
              {reserve.borrowingEnabled && (
                <BorrowAction
                  value={maxAmountToBorrow}
                  symbol={selectedAsset}
                  disable={disableBorrowButton}
                  onActionClicked={() => openBorrow(reserve.underlyingAsset)}
                />
              )}
              <ActionAlerts
                balance={balance.amount}
                user={user}
                maxAmountToSupply={maxAmountToSupply}
                maxAmountToBorrow={maxAmountToBorrow}
                reserve={reserve}
              />
            </Stack>
          </Box>
        </>
      )}
    </PaperWrapper>
  );
};

const FrozenWarning = () => {
  return (
    <Warning severity="error" icon={true}>
      <Trans>
        Since this asset is frozen, the only available actions are withdraw and repay which can be
        accessed from the <Link href={ROUTES.dashboard}>Dashboard</Link>
      </Trans>
    </Warning>
  );
};

const ActionAlerts = ({
  balance,
  user,
  maxAmountToSupply,
  maxAmountToBorrow,
  reserve,
}: {
  balance: string;
  user: ExtendedFormattedUser;
  maxAmountToSupply: string;
  maxAmountToBorrow: string;
  reserve: ComputedReserveData;
}) => {
  const { supplyCap, borrowCap, debtCeiling } = useAssetCaps();
  const { currentNetworkConfig, currentChainId } = useProtocolDataContext();
  const { bridge, name: networkName } = currentNetworkConfig;

  if (balance === '0') {
    // TODO: testnet message, link to faucet
    return (
      <WalletEmptyInfo name={networkName} bridge={bridge} icon={false} chainId={currentChainId} />
    );
  }

  if (balance !== '0' && user?.totalCollateralMarketReferenceCurrency === '0') {
    return (
      <Warning sx={{ mb: '12px' }} severity="info" icon={false}>
        <Trans>To borrow you need to supply any asset to be used as collateral.</Trans>
      </Warning>
    );
  }

  return (
    <>
      {maxAmountToSupply === '0' && supplyCap.determineWarningDisplay({ supplyCap, icon: false })}
      {maxAmountToBorrow === '0' && borrowCap.determineWarningDisplay({ borrowCap, icon: false })}
      {reserve.isIsolated &&
        balance !== '0' &&
        user?.totalCollateralUSD !== '0' &&
        debtCeiling.determineWarningDisplay({ debtCeiling, icon: false })}
    </>
  );
};

interface ActionProps {
  value: string;
  symbol: string;
  disable: boolean;
  onActionClicked: () => void;
}

const SupplyAction = ({ value, symbol, disable, onActionClicked }: ActionProps) => {
  return (
    <Stack
      sx={{ height: '44px' }}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box>
        <AvailableTooltip
          variant="description"
          text={<Trans>Available to supply</Trans>}
          capType={CapType.supplyCap}
        />
        <ValueWithSymbol value={value} symbol={symbol} />
      </Box>
      <Button
        sx={{ height: '36px' }}
        disabled={disable}
        variant="contained"
        fullWidth={false}
        onClick={onActionClicked}
        data-cy="supplyButton"
      >
        <Trans>Supply</Trans>
      </Button>
    </Stack>
  );
};

const BorrowAction = ({ value, symbol, disable, onActionClicked }: ActionProps) => {
  return (
    <Stack
      sx={{ height: '44px' }}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box>
        <AvailableTooltip
          variant="description"
          text={<Trans>Available to borrow</Trans>}
          capType={CapType.borrowCap}
        />
        <ValueWithSymbol value={value} symbol={symbol} />
      </Box>
      <Button
        sx={{ height: '36px' }}
        disabled={disable}
        variant="contained"
        fullWidth={false}
        onClick={onActionClicked}
        data-cy="borrowButton"
      >
        <Trans>Borrow</Trans>
      </Button>
    </Stack>
  );
};

const WrappedBaseAssetSelector = ({
  assetSymbol,
  baseAssetSymbol,
  selectedAsset,
  setSelectedAsset,
}: {
  assetSymbol: string;
  baseAssetSymbol: string;
  selectedAsset: string;
  setSelectedAsset: (value: string) => void;
}) => {
  return (
    <StyledToggleButtonGroup
      color="primary"
      value={selectedAsset}
      exclusive
      onChange={(_, value) => setSelectedAsset(value)}
      sx={{ width: '100%', mb: 4 }}
    >
      <StyledToggleButton value={assetSymbol}>
        <Typography variant="subheader1" sx={{ mr: 1 }}>
          {assetSymbol}
        </Typography>
      </StyledToggleButton>

      <StyledToggleButton value={baseAssetSymbol}>
        <Typography variant="subheader1" sx={{ mr: 1 }}>
          {baseAssetSymbol}
        </Typography>
      </StyledToggleButton>
    </StyledToggleButtonGroup>
  );
};

interface ValueWithSymbolProps {
  value: string;
  symbol: string;
  children?: ReactNode;
}

const ValueWithSymbol = ({ value, symbol, children }: ValueWithSymbolProps) => {
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <FormattedNumber value={value} variant="h4" color="text.primary" />
      <Typography variant="buttonL" color="text.secondary">
        {symbol}
      </Typography>
      {children}
    </Stack>
  );
};

interface WalletBalanceProps {
  balance: string;
  symbol: string;
  marketTitle: string;
}
const WalletBalance = ({ balance, symbol, marketTitle }: WalletBalanceProps) => {
  return (
    <Stack direction="row" gap={3}>
      <Box
        sx={(theme) => ({
          width: '42px',
          height: '42px',
          background: theme.palette.background.surface,
          border: `0.5px solid ${theme.palette.background.disabled}`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <img
          src="/icons/wallets/walletIcon.svg"
          width="20px"
          height="20px"
          alt="wallet icon"
          className="Wallet__icon"
          style={{
            opacity: 1,
            position: 'relative',
          }}
        />
      </Box>
      <Box>
        <Typography variant="description" color="text.secondary">
          Wallet balance
        </Typography>
        <ValueWithSymbol value={balance} symbol={symbol}>
          <BuyWithFiat cryptoSymbol={symbol} networkMarketName={marketTitle} />
        </ValueWithSymbol>
      </Box>
    </Stack>
  );
};

export const ReserveActions = ({ underlyingAsset }: ReserveActionsProps) => {
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const { openBorrow, openFaucet, openSupply } = useModalContext();
  const { currentAccount, loading: web3Loading } = useWeb3Context();
  const { user, reserves, loading: loadingReserves, eModes } = useAppDataContext();
  const { walletBalances, loading: loadingBalance } = useWalletBalances();
  const { isPermissionsLoading } = usePermissions();
  const { currentNetworkConfig, currentChainId, currentMarket } = useProtocolDataContext();
  const { bridge, name: networkName } = currentNetworkConfig;
  const {
    market: { marketTitle: networkMarketName },
  } = getMarketInfoById(currentMarket);
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
            <WalletEmptyInfo
              name={networkName}
              bridge={bridge}
              icon={false}
              chainId={currentChainId}
            />
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
          <Box mt={2}>
            <BuyWithFiat cryptoSymbol={poolReserve.symbol} networkMarketName={networkMarketName} />
          </Box>
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
      {canBorrow && (
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
          <FormattedNumber
            value={maxAmountToBorrow}
            variant="secondary14"
            symbol={poolReserve.symbol}
          />
        </Row>
      )}
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
            {getEmodeMessage(eModes[user.userEmodeCategoryId].label)} category. To manage E-Mode
            categories visit your <Link href={ROUTES.dashboard}>Dashboard</Link>.
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

      {poolReserve.isFrozen && currentNetworkConfig.name === 'Harmony' && (
        <Row align="flex-start" mb={3}>
          <MarketWarning marketName="Harmony" />
        </Row>
      )}
      {poolReserve.isFrozen && currentNetworkConfig.name === 'Fantom' && (
        <Row align="flex-start" mb={3}>
          <MarketWarning marketName="Fantom" />
        </Row>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button
          variant="contained"
          disabled={balance?.amount === '0'}
          onClick={() => openSupply(underlyingAsset)}
          fullWidth={downToXSM}
          data-cy={'supplyButton'}
        >
          <Trans>Supply</Trans> {downToXSM && poolReserve.symbol}
        </Button>

        {canBorrow && (
          <Button
            disabled={user?.totalCollateralMarketReferenceCurrency === '0'}
            variant="contained"
            onClick={() => openBorrow(underlyingAsset)}
            fullWidth={downToXSM}
            data-cy={'borrowButton'}
          >
            <Trans>Borrow</Trans> {downToXSM && poolReserve.symbol}
          </Button>
        )}
      </Stack>
      {maxAmountToSupply === '0' && supplyCap.determineWarningDisplay({ supplyCap, icon: false })}
      {maxAmountToBorrow === '0' && borrowCap.determineWarningDisplay({ borrowCap, icon: false })}
      {poolReserve.isIsolated &&
        balance?.amount !== '0' &&
        user?.totalCollateralUSD !== '0' &&
        debtCeiling.determineWarningDisplay({ debtCeiling, icon: false })}
    </PaperWrapper>
  );
};
