import { mintAmountsPerToken, valueToWei } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress } from '@mui/material';
import { useState } from 'react';
import Turnstile from 'react-turnstile';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsNumberLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { FaucetActions } from './FaucetActions';

export type FaucetModalContentProps = {
  underlyingAsset: string;
};

export enum ErrorType {}

export const FaucetModalContent = (props: ModalWrapperProps) => {
  const { currentMarketData } = useRootStore();

  if (currentMarketData.v3) {
    return <CaptchaFaucet poolReserve={props.poolReserve} />;
  } else {
    return <Faucet {...props} />;
  }
};

export const Faucet = ({ poolReserve, isWrongNetwork }: ModalWrapperProps) => {
  const { gasLimit, mainTxState: faucetTxState, txError } = useModalContext();
  const defaultValue = valueToWei('1000', 18);
  const mintAmount = mintAmountsPerToken[poolReserve.symbol.toUpperCase()]
    ? mintAmountsPerToken[poolReserve.symbol.toUpperCase()]
    : defaultValue;
  const normalizedAmount = normalize(mintAmount, poolReserve.decimals);

  if (faucetTxState.success)
    return (
      <TxSuccessView
        txHash={faucetTxState.txHash || ''}
        action={<Trans>Received</Trans>}
        symbol={poolReserve.symbol}
        amount={normalizedAmount}
      />
    );

  return (
    <>
      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLine
          description={<Trans>Amount</Trans>}
          iconSymbol={poolReserve.symbol}
          symbol={poolReserve.symbol}
          value={normalizedAmount}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <FaucetActions poolReserve={poolReserve} isWrongNetwork={isWrongNetwork} blocked={false} />
    </>
  );
};

export const CaptchaFaucet = ({ poolReserve }: { poolReserve: ComputedReserveData }) => {
  const { account, currentMarket, currentMarketData } = useRootStore();
  const { watchModeOnlyAddress } = useWeb3Context();

  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [captchaLoading, setCaptchaLoading] = useState<boolean>(true);
  const [txHash, setTxHash] = useState<string>('');

  const faucetUrl = `${process.env.NEXT_PUBLIC_API_BASEURL}/faucet`;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string;

  const defaultValue = valueToWei('1000', 18);
  const mintAmount = mintAmountsPerToken[poolReserve.symbol.toUpperCase()]
    ? mintAmountsPerToken[poolReserve.symbol.toUpperCase()]
    : defaultValue;
  const normalizedAmount = normalize(mintAmount, poolReserve.decimals);

  const captchaVerify = (token: string) => {
    setCaptchaToken(token);
    setCaptchaLoading(false);
  };

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
      {txHash}
      <Turnstile sitekey={siteKey} onVerify={captchaVerify} />
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
