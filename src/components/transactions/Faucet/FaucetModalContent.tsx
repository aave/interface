import { mintAmountsPerToken, valueToWei } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { MouseEventHandler, useEffect, useState } from 'react';
import Turnstile from 'react-turnstile';
import { Link } from 'src/components/primitives/Link';
import { useModalContext } from 'src/hooks/useModal';
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

export const FaucetModalContent = ({ poolReserve, isWrongNetwork }: ModalWrapperProps) => {
  const { gasLimit, mainTxState: faucetTxState, txError } = useModalContext();
  const { account, currentMarket } = useRootStore();
  const defaultValue = valueToWei('1000', 18);
  const mintAmount = mintAmountsPerToken[poolReserve.symbol.toUpperCase()]
    ? mintAmountsPerToken[poolReserve.symbol.toUpperCase()]
    : defaultValue;
  const normalizedAmount = normalize(mintAmount, poolReserve.decimals);

  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');

  if (faucetTxState.success)
    return (
      <TxSuccessView
        action={<Trans>Received</Trans>}
        symbol={poolReserve.symbol}
        amount={normalizedAmount}
      />
    );

  const faucetUrl = `${process.env.NEXT_PUBLIC_API_BASEURL}/faucet`;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  const faucet = async () => {
    try {
      setTxHash('');
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
        }),
      });
      const data = await response.json();
      setTxHash(data.msg);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Turnstile sitekey={siteKey} onVerify={setCaptchaToken} />
      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLine
          description={<Trans>Amount</Trans>}
          iconSymbol={poolReserve.symbol}
          symbol={poolReserve.symbol}
          value={normalizedAmount}
        />
      </TxModalDetails>

      <Button type="submit" onClick={faucet}>
        Mint
      </Button>
      {txHash && <Link href={`https://goerli.etherscan.io/tx/${txHash}`}>View on Etherscan</Link>}
      {/* {txError && <GasEstimationError txError={txError} />}

      <FaucetActions poolReserve={poolReserve} isWrongNetwork={isWrongNetwork} blocked={false} /> */}
    </>
  );
};
