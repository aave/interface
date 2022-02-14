import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Button, Typography } from '@mui/material';
import { Box } from '@mui/system';
import * as React from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { MainLayout } from 'src/layouts/MainLayout';

import { ContentContainer } from '../src/components/ContentContainer';
import { ListColumn } from '../src/components/lists/ListColumn';
import { ListHeaderTitle } from '../src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from '../src/components/lists/ListHeaderWrapper';
import { ListItem } from '../src/components/lists/ListItem';
import { ListWrapper } from '../src/components/lists/ListWrapper';
import { FormattedNumber } from '../src/components/primitives/FormattedNumber';
import { TokenIcon } from '../src/components/primitives/TokenIcon';
import { TopInfoPanel } from '../src/components/TopInfoPanel/TopInfoPanel';
import { useAppDataContext } from '../src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from '../src/hooks/app-data-provider/useWalletBalances';
import { useProtocolDataContext } from '../src/hooks/useProtocolDataContext';

export default function Faucet() {
  const { currentNetworkConfig } = useProtocolDataContext();
  const { reserves } = useAppDataContext();
  const { walletBalances } = useWalletBalances();
  const { openFaucet } = useModalContext();

  const listData = reserves
    .filter(
      (reserve) =>
        reserve.symbol.toUpperCase() !== currentNetworkConfig.baseAssetSymbol &&
        !reserve.isFrozen &&
        reserve.symbol.toUpperCase() !== currentNetworkConfig.wrappedBaseAssetSymbol
    )
    .map((reserve) => {
      const walletBalanceUSD = valueToBigNumber(
        walletBalances[reserve.underlyingAsset]?.amountUSD || '0'
      );
      return {
        ...reserve,
        walletBalanceUSD,
      };
    });

  return (
    <>
      <TopInfoPanel pageTitle={<Trans>Faucet</Trans>} />

      <ContentContainer>
        <ListWrapper title={<Trans>Faucet</Trans>} captionSize="h2">
          <ListHeaderWrapper px={6}>
            <ListColumn isRow maxWidth={280}>
              <ListHeaderTitle>
                <Trans>Asset</Trans>
              </ListHeaderTitle>
            </ListColumn>
            <ListColumn>
              <ListHeaderTitle>
                <Trans>Wallet balance</Trans>
              </ListHeaderTitle>
            </ListColumn>
            <ListColumn maxWidth={280} />
          </ListHeaderWrapper>

          {listData.map((reserve) => (
            <ListItem px={6} key={reserve.symbol}>
              <ListColumn isRow maxWidth={280}>
                <TokenIcon symbol={reserve.iconSymbol} fontSize="large" />
                <Box sx={{ pl: 3.5 }}>
                  <Typography variant="h4">{reserve.name}</Typography>
                  <Typography variant="subheader2" color="text.disabled">
                    {reserve.symbol}
                  </Typography>
                </Box>
              </ListColumn>

              <ListColumn>
                <FormattedNumber
                  compact
                  value={reserve.walletBalanceUSD.toString()}
                  variant="main16"
                  symbol="USD"
                />
              </ListColumn>

              <ListColumn maxWidth={280} align="right">
                <Button variant="contained" onClick={() => openFaucet(reserve.underlyingAsset)}>
                  <Trans>Faucet</Trans>
                </Button>
              </ListColumn>
            </ListItem>
          ))}
        </ListWrapper>
      </ContentContainer>
    </>
  );
}

Faucet.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
