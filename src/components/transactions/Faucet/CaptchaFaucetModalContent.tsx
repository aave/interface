import { mintAmountsPerToken, valueToWei } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useState } from 'react';
import Turnstile from 'react-turnstile';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { selectCurrentReserves } from 'src/store/poolSelectors';
import { useRootStore } from 'src/store/root';

import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsNumberLine } from '../FlowCommons/TxModalDetails';

export const CaptchaFaucetModalContent = ({ underlyingAsset }: { underlyingAsset: string }) => {
  const { account, currentMarket, currentMarketData } = useRootStore();
  const reserves = useRootStore((state) => selectCurrentReserves(state));

  const { watchModeOnlyAddress } = useWeb3Context();

  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [captchaLoading, setCaptchaLoading] = useState<boolean>(true);
  const [txHash, setTxHash] = useState<string>('');

  const faucetUrl = `${process.env.NEXT_PUBLIC_API_BASEURL}/faucet`;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string;

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  const defaultValue = valueToWei('1000', 18);
  const mintAmount = mintAmountsPerToken[poolReserve.symbol.toUpperCase()]
    ? mintAmountsPerToken[poolReserve.symbol.toUpperCase()]
    : defaultValue;
  const normalizedAmount = normalize(mintAmount, poolReserve.decimals);

  const captchaVerify = (token: string) => {
    setCaptchaToken(token);
    setCaptchaLoading(false);
  };

  console.log(poolReserve.underlyingAsset);

  const faucet = async () => {
    try {
      setTxHash('');
      setLoading(true);
      const response = await fetch(faucetUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: account,
          captchaToken,
          market: currentMarket,
          tokenAddress: poolReserve.underlyingAsset,
          tokenSymbol: poolReserve.symbol,
          faucetAddress: currentMarketData.addresses.FAUCET,
        }),
      });
      const data = await response.json();
      setTxHash(data.msg);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (txHash) {
    return (
      <TxSuccessView
        txHash={txHash}
        action={<Trans>Received</Trans>}
        symbol={poolReserve.symbol}
        amount={normalizedAmount}
      />
    );
  }

  return (
    <>
      <Turnstile sitekey={siteKey} onVerify={captchaVerify} />
      <Typography variant="h2" sx={{ mb: 6 }}>
        <Trans>Faucet</Trans> {poolReserve.symbol}
      </Typography>
      <Box
        sx={(theme) => ({
          p: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '4px',
          '.MuiBox-root:last-of-type': {
            mb: 0,
          },
        })}
      >
        <DetailsNumberLine
          description={<Trans>Amount</Trans>}
          iconSymbol={poolReserve.symbol}
          symbol={poolReserve.symbol}
          value={normalizedAmount}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', mt: 12 }}>
        <Button
          variant="contained"
          disabled={loading || !captchaToken || watchModeOnlyAddress !== undefined}
          onClick={faucet}
          size="large"
          sx={{ minHeight: '44px' }}
        >
          {(loading || captchaLoading) && (
            <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
          )}
          {<Trans>Faucet {poolReserve.symbol}</Trans>}
        </Button>
      </Box>
    </>
  );
};
