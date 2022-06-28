import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Button, Typography, useMediaQuery, useTheme, Box } from '@mui/material';
import * as React from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ListItem } from 'src/components/lists/ListItem';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { FaucetItemLoader } from './FaucetItemLoader';
import { FaucetMobileItemLoader } from './FaucetMobileItemLoader';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

export default function FaucetAssetsList() {
  const { reserves, loading } = useAppDataContext();
  const { walletBalances } = useWalletBalances();
  const { openFaucet } = useModalContext();
  const { currentAccount, loading: web3Loading } = useWeb3Context();

  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const listData = reserves
    .filter((reserve) => !reserve.isWrappedBaseAsset && !reserve.isFrozen)
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
    <ListWrapper title={<Trans>Test Assets</Trans>} captionSize="h2">
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
          <ListItem px={downToXSM ? 4 : 6} key={reserve.symbol}>
            <ListColumn isRow maxWidth={280}>
              <TokenIcon symbol={reserve.iconSymbol} fontSize="large" />
              <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
                <Typography variant="h4" noWrap>
                  {reserve.name}
                </Typography>
                <Typography variant="subheader2" color="text.muted" noWrap>
                  {reserve.symbol}
                </Typography>
              </Box>
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
              <Button variant="contained" onClick={() => openFaucet(reserve.underlyingAsset)}>
                <Trans>Faucet</Trans>
              </Button>
            </ListColumn>
          </ListItem>
        ))
      )}
    </ListWrapper>
  );
}
