import { mintAmountsPerToken } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsNumberLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { FaucetActions } from './FaucetActions';

export type FaucetModalContentProps = {
  underlyingAsset: string;
};

export enum ErrorType {}

export const FaucetModalContent = ({ underlyingAsset }: FaucetModalContentProps) => {
  const { reserves } = useAppDataContext();
  const { currentChainId, currentNetworkConfig } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();
  const { gasLimit, mainTxState: faucetTxState } = useModalContext();

  const poolReserve = reserves.find((reserve) => {
    return reserve.underlyingAsset === underlyingAsset;
  }) as ComputedReserveData;

  const mintAmount = mintAmountsPerToken[poolReserve.symbol.toUpperCase()];
  const normalizedAmount = normalize(mintAmount, poolReserve.decimals);

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  // token info to add to wallet
  const addToken: ERC20TokenType = {
    address: underlyingAsset,
    symbol: poolReserve.iconSymbol,
    decimals: poolReserve.decimals,
  };

  if (faucetTxState.txError) return <TxErrorView errorMessage={faucetTxState.txError} />;
  if (faucetTxState.success)
    return (
      <TxSuccessView
        action="received"
        symbol={poolReserve.symbol}
        amount={normalizedAmount}
        addToken={addToken}
      />
    );

  return (
    <>
      <TxModalTitle title="Faucet" symbol={poolReserve.symbol} />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={currentNetworkConfig.name} chainId={currentChainId} />
      )}

      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLine
          description={<Trans>Amount</Trans>}
          iconSymbol={poolReserve.symbol}
          symbol={poolReserve.symbol}
          value={normalizedAmount}
        />
      </TxModalDetails>

      {faucetTxState.gasEstimationError && (
        <GasEstimationError error={faucetTxState.gasEstimationError} />
      )}

      <FaucetActions poolReserve={poolReserve} isWrongNetwork={isWrongNetwork} blocked={false} />
    </>
  );
};
