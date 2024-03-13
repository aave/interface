import { valueToBigNumber } from '@aave/math-utils';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ListItem } from 'src/components/lists/ListItem';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

import { FaucetItemLoader } from './FaucetItemLoader';
import { FaucetMobileItemLoader } from './FaucetMobileItemLoader';

export default function FaucetAssetsList() {
  const { reserves, loading } = useAppDataContext();
  const { openFaucet } = useModalContext();
  const { currentAccount, loading: web3Loading } = useWeb3Context();
  const currentMarket = useRootStore((store) => store.currentMarket);
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { walletBalances } = useWalletBalances(currentMarketData);

  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const listData = reserves
    .filter(
      (reserve) => !reserve.isWrappedBaseAsset && !reserve.isFrozen && reserve.symbol !== 'GHO'
    )
    .map((reserve) => {
      const walletBalance = valueToBigNumber(
        walletBalances[reserve.underlyingAsset]?.amount || '0'
      );
      return {
        ...reserve,
        walletBalance,
      };
    });

  if (!currentAccount || web3Loading) {
    return (
      <ConnectWalletPaper
        loading={web3Loading}
        description={<Trans>Please connect your wallet to get free testnet assets.</Trans>}
      />
    );
  }

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h2" sx={{ mr: 4 }}>
          <Trans>Test Assets</Trans>
        </Typography>
      }
    >
      <ListHeaderWrapper px={downToXSM ? 4 : 6}>
        <ListColumn isRow maxWidth={280}>
          <ListHeaderTitle>
            <Trans>Asset</Trans>
          </ListHeaderTitle>
        </ListColumn>

        {!downToXSM && (
          <ListColumn>
            <ListHeaderTitle>
              <Trans>Wallet balance</Trans>
            </ListHeaderTitle>
          </ListColumn>
        )}

        <ListColumn maxWidth={280} />
      </ListHeaderWrapper>

      {loading ? (
        downToXSM ? (
          <>
            <FaucetMobileItemLoader />
            <FaucetMobileItemLoader />
            <FaucetMobileItemLoader />
          </>
        ) : (
          <>
            <FaucetItemLoader />
            <FaucetItemLoader />
            <FaucetItemLoader />
            <FaucetItemLoader />
            <FaucetItemLoader />
          </>
        )
      ) : (
        listData.map((reserve) => (
          <ListItem
            px={downToXSM ? 4 : 6}
            key={reserve.symbol}
            data-cy={`faucetListItem_${reserve.symbol.toUpperCase()}`}
          >
            <ListColumn isRow maxWidth={280}>
              <Link
                href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
                noWrap
                sx={{ display: 'inline-flex', alignItems: 'center' }}
              >
                <TokenIcon symbol={reserve.iconSymbol} fontSize="large" />
                <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
                  <Typography variant="h4" noWrap>
                    {reserve.name}
                  </Typography>
                  <Typography variant="subheader2" color="text.muted" noWrap>
                    {reserve.symbol}
                  </Typography>
                </Box>
              </Link>
            </ListColumn>

            {!downToXSM && (
              <ListColumn>
                <FormattedNumber
                  compact
                  value={reserve.walletBalance.toString()}
                  variant="main16"
                />
              </ListColumn>
            )}

            <ListColumn maxWidth={280} align="right">
              {!currentMarketData.addresses.FAUCET ? (
                <Button
                  href="https://faucet.circle.com/"
                  component={Link}
                  variant="contained"
                  endIcon={
                    <SvgIcon sx={{ width: 14, height: 14 }}>
                      <ExternalLinkIcon />
                    </SvgIcon>
                  }
                >
                  <Trans>Faucet</Trans>
                </Button>
              ) : (
                <Button variant="contained" onClick={() => openFaucet(reserve.underlyingAsset)}>
                  <Trans>Faucet</Trans>
                </Button>
              )}
            </ListColumn>
          </ListItem>
        ))
      )}
    </ListWrapper>
  );
}
