import { InterestRate } from '@aave/contract-helpers';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { useRef, useState } from 'react';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useSwap } from 'src/hooks/useSwap';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { Asset, AssetInput } from '../AssetInput';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import {
  DetailsHFLine,
  DetailsNumberLineWithSub,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { CollateralRepayActions } from './CollateralRepayActions';

interface RepayAsset extends Asset {
  balance: string;
  address: string;
}

export function CollateralRepayModalContent({
  poolReserve,
  symbol,
  debtType,
  userReserve,
  isWrongNetwork,
}: ModalWrapperProps & { debtType: InterestRate }) {
  const { user, marketReferencePriceInUsd } = useAppDataContext();
  const { gasLimit } = useModalContext();
  const { currentChainId } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();
  const repayTokens = user?.userReservesData
    .filter((userReserve) => userReserve.underlyingBalance !== '0')
    .map((userReserve) => ({
      address: userReserve.underlyingAsset,
      balance: userReserve.underlyingBalance,
      symbol: userReserve.reserve.symbol,
      iconSymbol: userReserve.reserve.iconSymbol,
      aToken: true,
    }));
  const [tokenToRepayWith, setTokenToRepayWith] = useState<RepayAsset>(
    repayTokens[0] as RepayAsset
  );
  const swapSourceUserReserve = user?.userReservesData.find(
    (userReserve) => userReserve.underlyingAsset === tokenToRepayWith.address
  ) as ComputedUserReserveData;
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>('');

  const debt =
    debtType === InterestRate.Stable ? userReserve.stableBorrows : userReserve.variableBorrows;
  const safeAmountToRepayAll = valueToBigNumber(debt).multipliedBy('1.0025');

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? safeAmountToRepayAll.toString() : _amount;
  const usdValue = valueToBigNumber(amount).multipliedBy(poolReserve.priceInUSD);

  const { priceRoute, inputAmountUSD, inputAmount, outputAmount, outputAmountUSD } = useSwap({
    chainId: currentChainId,
    userId: currentAccount,
    variant: 'exactOut',
    swapIn: { ...swapSourceUserReserve?.reserve, amount: '0' },
    swapOut: { ...poolReserve, amount: amountRef.current },
    max: isMaxSelected,
  });

  const amountAfterRepay = valueToBigNumber(debt).minus(amount || '0');
  const displayAmountAfterRepayInUsd = amountAfterRepay
    .multipliedBy(poolReserve.formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS);

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? safeAmountToRepayAll.toString() : value;
    setAmount(value);
  };

  return (
    <>
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={usdValue.toString()}
        symbol={tokenToRepayWith.symbol}
        assets={[
          {
            address: poolReserve.underlyingAsset,
            symbol: poolReserve.symbol,
            iconSymbol: poolReserve.iconSymbol,
            balance: debt,
          },
        ]}
        isMaxSelected={isMaxSelected}
        maxValue={debt}
      />
      <AssetInput
        value={inputAmount}
        usdValue={inputAmountUSD}
        symbol={tokenToRepayWith.symbol}
        assets={repayTokens}
        onSelect={setTokenToRepayWith}
        disableInput
      />
      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLineWithSub
          description={<Trans>Remaining debt</Trans>}
          amount={amountAfterRepay.toString()}
          amountUSD={displayAmountAfterRepayInUsd.toString()}
          symbol={symbol}
        />
        <DetailsHFLine
          visibleHfChange={!!_amount}
          healthFactor={user?.healthFactor}
          futureHealthFactor={'2' /** TODO */}
        />
      </TxModalDetails>
      <CollateralRepayActions
        poolReserve={poolReserve}
        amountToRepay={isMaxSelected ? safeAmountToRepayAll.toString() : amount}
        poolAddress={tokenToRepayWith.address}
        isWrongNetwork={isWrongNetwork}
        symbol={symbol}
        debtType={debtType}
      />
    </>
  );
}
