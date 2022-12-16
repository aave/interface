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
import { getNormalizedMintAmount } from './utils';

export const CaptchaFaucetModalContent = ({ underlyingAsset }: { underlyingAsset: string }) => {
  const { watchModeOnlyAddress } = useWeb3Context();
  const { account, currentMarket, currentMarketData } = useRootStore();
  const reserves = useRootStore((state) => selectCurrentReserves(state));

  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [captchaLoading, setCaptchaLoading] = useState<boolean>(true);
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');

  const faucetUrl = `${process.env.NEXT_PUBLIC_API_BASEURL}/faucet`;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string;

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  const normalizedAmount = getNormalizedMintAmount(poolReserve.symbol, poolReserve.decimals);

  const captchaVerify = (token: string) => {
    setCaptchaToken(token);
    setCaptchaLoading(false);
  };

  const faucet = async () => {
    try {
      setTxHash('');
      setLoading(true);
      setError('');
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
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      setTxHash(data.msg);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An error occurred trying to send the transaction');
      }
    } finally {
      setLoading(false);
    }
  };

  if (txHash) {
    return (
      <TxSuccessView
        txHash={txHash}
        action={<Trans>will receive</Trans>}
        symbol={poolReserve.symbol}
        amount={normalizedAmount}
      />
    );
  }

  return (
    <>
      <Turnstile sitekey={siteKey} onVerify={captchaVerify} autoResetOnExpire />
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
      <Typography variant="helperText" color="error.main">
        {error}
      </Typography>
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
