import { healthFactorPreview } from '@aave/client/actions';
import { API_ETH_MOCK_ADDRESS, synthetixProxyByChainId } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { bigDecimal, ChainId, evmAddress } from '@aave/types';
import { Trans } from '@lingui/macro';
import Typography from '@mui/material/Typography';
import { BigNumber } from 'bignumber.js';
import { client } from 'pages/_app.page';
import React, { useEffect, useRef, useState } from 'react';
import { Warning } from 'src/components/primitives/Warning';
import { ExtendedFormattedUser } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { useShallow } from 'zustand/shallow';

import { Asset, AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperSDKProps } from '../FlowCommons/ModalWrapperSDK';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsHFLine,
  DetailsNumberLineWithSub,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { RepayActionsSDK } from './RepayActionsSDK';

interface RepayAsset extends Asset {
  balance: string;
}

export const RepayModalContentSDK = ({
  poolReserve,
  userSupplies,
  userBorrows,
  symbol: modalSymbol,
  tokenBalance,
  nativeBalance,
  isWrongNetwork,
  marketUserState,
}: ModalWrapperSDKProps & { user: ExtendedFormattedUser }) => {
  const { gasLimit, mainTxState: repayTxState, txError } = useModalContext();

  const [minRemainingBaseTokenBalance, currentChainId, currentMarketData, currentMarket] =
    useRootStore(
      useShallow((store) => [
        store.poolComputed.minRemainingBaseTokenBalance,
        store.currentChainId,
        store.currentMarketData,
        store.currentMarket,
      ])
    );

  // states
  const [tokenToRepayWith, setTokenToRepayWith] = useState<RepayAsset>({
    address: poolReserve.underlyingToken.address.toLowerCase(),
    symbol: poolReserve.underlyingToken.symbol,
    iconSymbol: poolReserve.underlyingToken.symbol,
    balance: tokenBalance,
  });
  const [assets, setAssets] = useState<RepayAsset[]>([tokenToRepayWith]);
  const [repayMax, setRepayMax] = useState('');
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();
  const [showUSDTResetWarning, setShowUSDTResetWarning] = useState(false);
  const [hfPreviewAfter, setHfPreviewAfter] = useState<string | undefined>();
  const { currentAccount } = useWeb3Context();
  const networkConfig = getNetworkConfig(currentChainId);

  const userBorrowedPosition = userBorrows?.find(
    (borrow) => borrow.currency.address === poolReserve.underlyingToken.address
  );
  const userSuppliedPosition = userSupplies?.find(
    (supply) => supply.currency.address === poolReserve.underlyingToken.address
  );

  const repayWithATokens = tokenToRepayWith.address === poolReserve.aToken.address.toLowerCase();

  const debt = userBorrowedPosition?.debt.amount.value || '0';
  const debtUSD = userBorrowedPosition?.debt.usd || '0';

  const safeAmountToRepayAll = valueToBigNumber(debt)
    .multipliedBy('1.0025')
    .decimalPlaces(poolReserve.underlyingToken.decimals, BigNumber.ROUND_UP);
  const underlyingBalanceAtokens = userSuppliedPosition?.balance.amount.value || '0';
  // calculate max amount abailable to repay
  let maxAmountToRepay: BigNumber;
  let balance: string;
  if (repayWithATokens) {
    maxAmountToRepay = BigNumber.min(underlyingBalanceAtokens, debt);
    balance = underlyingBalanceAtokens;
  } else {
    //! mira que quizas hay que quirtar el minRemainingBaseTokenBalance, ya que ya se calcula en e SDK
    const normalizedWalletBalance = valueToBigNumber(tokenToRepayWith.balance).minus(
      poolReserve.underlyingToken.symbol === networkConfig.baseAssetSymbol
        ? minRemainingBaseTokenBalance
        : '0'
    );
    balance = normalizedWalletBalance.toString(10);
    maxAmountToRepay = BigNumber.min(normalizedWalletBalance, debt);
  }

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToRepay.toString(10) : _amount;

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToRepay.toString(10) : value;
    setAmount(value);
    if (maxSelected && (repayWithATokens || maxAmountToRepay.eq(debt))) {
      if (
        tokenToRepayWith.address === API_ETH_MOCK_ADDRESS.toLowerCase() ||
        (synthetixProxyByChainId[currentChainId] &&
          synthetixProxyByChainId[currentChainId].toLowerCase() ===
            poolReserve.underlyingToken.address.toLowerCase())
      ) {
        // for native token and synthetix (only mainnet) we can't send -1 as
        // contract does not accept max unit256
        setRepayMax(safeAmountToRepayAll.toString(10));
      } else {
        // -1 can always be used for v3 otherwise
        // for v2 we can onl use -1 when user has more balance than max debt to repay
        // this is accounted for when maxAmountToRepay.eq(debt) as maxAmountToRepay is
        // min between debt and walletbalance, so if it enters here for v2 it means
        // balance is bigger and will be able to transact with -1
        setRepayMax('-1');
      }
    } else {
      setRepayMax(
        safeAmountToRepayAll.lt(balance)
          ? safeAmountToRepayAll.toString(10)
          : maxAmountToRepay.toString(10)
      );
    }
  };

  // token info
  useEffect(() => {
    const repayTokens: RepayAsset[] = [];
    // set possible repay tokens
    // if wrapped reserve push both wrapped / native
    if (poolReserve.underlyingToken.symbol === networkConfig.wrappedBaseAssetSymbol) {
      const nativeTokenWalletBalance = valueToBigNumber(nativeBalance);
      const maxNativeToken = BigNumber.max(
        nativeTokenWalletBalance,
        BigNumber.min(nativeTokenWalletBalance, debt)
      );
      repayTokens.push({
        address: API_ETH_MOCK_ADDRESS.toLowerCase(),
        symbol: networkConfig.baseAssetSymbol,
        balance: maxNativeToken.toString(10),
      });
    }
    // push reserve asset
    const minReserveTokenRepay = BigNumber.min(valueToBigNumber(tokenBalance), debt);
    const maxReserveTokenForRepay = BigNumber.max(minReserveTokenRepay, tokenBalance);
    repayTokens.push({
      address: poolReserve.underlyingToken.address.toLowerCase(),
      symbol: poolReserve.underlyingToken.symbol,
      iconSymbol: poolReserve.underlyingToken.symbol,
      balance: maxReserveTokenForRepay.toString(10),
    });
    // push reserve aToken
    if (
      currentMarketData.v3 &&
      !displayGhoForMintableMarket({ symbol: poolReserve.underlyingToken.symbol, currentMarket })
    ) {
      //! mirar aqui , quizas bug
      // const aTokenBalance = valueToBigNumber(userSuppliedPosition?.balance.amount.value || '0');
      const maxBalance = BigNumber.max(
        underlyingBalanceAtokens,
        BigNumber.min(underlyingBalanceAtokens, debt).toString(10)
      );
      repayTokens.push({
        address: poolReserve.aToken.address.toLowerCase(),
        symbol: `a${poolReserve.underlyingToken.symbol}`,
        iconSymbol: poolReserve.underlyingToken.symbol,
        aToken: true,
        balance: maxBalance.toString(10),
      });
    }
    setAssets(repayTokens);
    setTokenToRepayWith(repayTokens[0]);
  }, []);

  // debt remaining after repay
  const amountAfterRepay = valueToBigNumber(debt)
    .minus(amount || '0')
    .toString(10);
  const amountAfterRepayInUsd = valueToBigNumber(amountAfterRepay).multipliedBy(
    poolReserve.usdExchangeRate
  );

  const maxRepayWithDustRemaining = isMaxSelected && amountAfterRepayInUsd.toNumber() > 0;

  // health factor preview via SDK
  useEffect(() => {
    const timer = setTimeout(async () => {
      const amountForPreview = isMaxSelected ? repayMax : amount;
      const normalized = valueToBigNumber(amountForPreview || '0');

      if (!amountForPreview || normalized.isZero()) {
        setHfPreviewAfter(undefined);
        return;
      }

      const requestAmount =
        tokenToRepayWith.address === API_ETH_MOCK_ADDRESS.toLowerCase()
          ? { native: bigDecimal(normalized.toString(10)) }
          : {
              erc20: {
                currency: evmAddress(poolReserve.underlyingToken.address),
                value: { exact: bigDecimal(normalized.toString(10)) },
              },
            };

      try {
        const result = await healthFactorPreview(client, {
          action: {
            repay: {
              market: evmAddress(currentMarketData.addresses.LENDING_POOL),
              amount: requestAmount,
              sender: evmAddress(currentAccount),
              chainId: currentMarketData.chainId as ChainId,
            },
          },
        });

        if (result.isOk()) {
          console.log('HF PREVIEW REPAY SDK', result.value);
          setHfPreviewAfter(result.value.after?.toString());
        } else {
          setHfPreviewAfter(undefined);
        }
      } catch {
        setHfPreviewAfter(undefined);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    amount,
    currentMarketData.addresses.LENDING_POOL,
    currentMarketData.chainId,
    isMaxSelected,
    poolReserve.underlyingToken.address,
    repayMax,
    tokenToRepayWith.address,
    currentAccount,
  ]);

  // calculating input usd value
  const usdValue = valueToBigNumber(amount).multipliedBy(poolReserve.usdExchangeRate ?? '0');

  if (repayTxState.success)
    return (
      <TxSuccessView
        action={<Trans>repaid</Trans>}
        amount={amountRef.current}
        symbol={repayWithATokens ? poolReserve.underlyingToken.symbol : tokenToRepayWith.symbol}
      />
    );

  return (
    <>
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={usdValue.toString(10)}
        symbol={tokenToRepayWith.symbol}
        assets={assets}
        onSelect={setTokenToRepayWith}
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToRepay.toString(10)}
        balanceText={<Trans>Wallet balance</Trans>}
      />

      {maxRepayWithDustRemaining && (
        <Typography color="warning.main" variant="helperText">
          <Trans>
            You don’t have enough funds in your wallet to repay the full amount. If you proceed to
            repay with your current amount of funds, you will still have a small borrowing position
            in your dashboard.
          </Trans>
        </Typography>
      )}

      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLineWithSub
          description={<Trans>Remaining debt</Trans>}
          futureValue={amountAfterRepay}
          futureValueUSD={amountAfterRepayInUsd.toString(10)}
          value={debt}
          valueUSD={debtUSD.toString()}
          symbol={
            poolReserve.underlyingToken.symbol === networkConfig.wrappedBaseAssetSymbol
              ? networkConfig.baseAssetSymbol
              : poolReserve.underlyingToken.symbol
          }
        />
        <DetailsHFLine
          visibleHfChange={!!_amount}
          healthFactor={marketUserState?.healthFactor || '0'}
          futureHealthFactor={hfPreviewAfter}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      {showUSDTResetWarning && (
        <Warning severity="info" sx={{ mt: 5 }}>
          <Typography variant="caption">
            <Trans>
              USDT on Ethereum requires approval reset before a new approval. This will require an
              additional transaction.
            </Trans>
          </Typography>
        </Warning>
      )}

      <RepayActionsSDK
        maxApproveNeeded={safeAmountToRepayAll.toString()}
        poolReserve={poolReserve}
        amountToRepay={isMaxSelected ? repayMax : amount}
        poolAddress={
          repayWithATokens ? poolReserve.underlyingToken.address : tokenToRepayWith.address ?? ''
        }
        isWrongNetwork={isWrongNetwork}
        symbol={modalSymbol}
        repayWithATokens={repayWithATokens}
        setShowUSDTResetWarning={setShowUSDTResetWarning}
        chainId={currentChainId}
        maxAmountToRepay={maxAmountToRepay.toString(10)}
      />
    </>
  );
};
