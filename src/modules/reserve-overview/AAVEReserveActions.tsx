import { Trans } from '@lingui/macro';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Skeleton,
  Stack,
  SvgIcon,
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
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getMaxAmountAvailableToSupply } from 'src/utils/getMaxAmountAvailableToSupply';

import { Row } from '../../components/primitives/Row';
import { Link, ROUTES } from '../../components/primitives/Link';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import { AvailableTooltip } from 'src/components/infoTooltips/AvailableTooltip';
import { CapType } from 'src/components/caps/helper';

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

export const AAVEReserveActions = ({ underlyingAsset }: ReserveActionsProps) => {
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const { openSupply } = useModalContext();

  const { currentAccount, loading: web3Loading } = useWeb3Context();
  const { user, reserves, loading: loadingReserves } = useAppDataContext();
  const { walletBalances, loading: loadingBalance } = useWalletBalances();

  const { currentNetworkConfig } = useProtocolDataContext();
  const { bridge, name: networkName } = currentNetworkConfig;

  if (!currentAccount)
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
  const maxAmountToSupply = getMaxAmountAvailableToSupply(
    balance.amount,
    poolReserve,
    underlyingAsset
  ).toString();

  return (
    <PaperWrapper>
      {balance?.amount === '0' ? (
        <Row align="flex-start" mb={6}>
          <Alert severity="info" icon={false}>
            <Trans>Your {networkName} wallet is empty. Purchase or transfer assets</Trans>{' '}
            {bridge && (
              <Trans>
                or use {<Link href={bridge.url}>{bridge.name}</Link>} to transfer your ETH assets.
              </Trans>
            )}
          </Alert>
        </Row>
      ) : (
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

      {poolReserve.symbol === 'AAVE' && balance?.amount !== '0' && (
        <Alert sx={{ mb: '12px' }} severity="info" icon={false}>
          <Trans>
            Supplying your AAVE tokens is not the same as staking them. If you wish to stake your
            AAVE tokens, please go to the <Link href={ROUTES.dashboard}>Staking View</Link>.
          </Trans>
        </Alert>
      )}

      <Row mb={5} />

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          disabled={balance?.amount === '0'}
          onClick={() => openSupply(underlyingAsset)}
          fullWidth={downToXSM}
        >
          <Trans>Supply</Trans> {(downToXSM || poolReserve.symbol === 'AAVE') && poolReserve.symbol}
        </Button>
        {balance?.amount !== '0' && (
          <Button variant="text" fullWidth={downToXSM}>
            <Trans>
              <Link
                href={ROUTES.staking}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: 'black',
                }}
              >
                Stake AAVE{' '}
                <SvgIcon sx={{ fontSize: '18px' }}>
                  <ExternalLinkIcon />
                </SvgIcon>
              </Link>
            </Trans>
          </Button>
        )}
      </Stack>
    </PaperWrapper>
  );
};
