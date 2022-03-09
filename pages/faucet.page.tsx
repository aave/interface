import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import * as React from 'react';
import { FaucetModal } from 'src/components/transactions/Faucet/FaucetModal';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
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

export default function Faucet() {
  const { currentMarketData } = useProtocolDataContext();
  const { reserves } = useAppDataContext();
  const { walletBalances } = useWalletBalances();
  const { openFaucet } = useModalContext();

  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const listData = reserves
    .filter((reserve) => !reserve.isWrappedBaseAsset && !reserve.isFrozen)
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
      <TopInfoPanel pageTitle={<Trans>{currentMarketData.marketTitle} Faucet</Trans>} />

      <ContentContainer>
        <ListWrapper title={<Trans>Assets</Trans>} captionSize="h2">
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

          {listData.map((reserve) => (
            <ListItem px={downToXSM ? 4 : 6} key={reserve.symbol}>
              <ListColumn isRow maxWidth={280}>
                <TokenIcon symbol={reserve.iconSymbol} fontSize="large" />
                <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
                  <Typography variant="h4" noWrap>
                    {reserve.name}
                  </Typography>
                  <Typography variant="subheader2" color="text.disabled" noWrap>
                    {reserve.symbol}
                  </Typography>
                </Box>
              </ListColumn>

              {!downToXSM && (
                <ListColumn>
                  <FormattedNumber
                    compact
                    value={reserve.walletBalanceUSD.toString()}
                    variant="main16"
                    symbol="USD"
                  />
                </ListColumn>
              )}

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
  return (
    <MainLayout>
      {page}
      <FaucetModal />
    </MainLayout>
  );
};
