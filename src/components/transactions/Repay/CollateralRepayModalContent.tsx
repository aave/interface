import { InterestRate } from '@aave/contract-helpers';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { useRef, useState } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { Asset, AssetInput } from '../AssetInput';
import {
  DetailsHFLine,
  DetailsNumberLineWithSub,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { ReserveModalProps } from './RepayModal';

interface RepayAsset extends Asset {
  balance: string;
}

export function CollateralRepayModalContent({
  poolReserve,
  symbol,
  debtType,
  userReserve,
}: ReserveModalProps & { debtType: InterestRate }) {
  const { user, marketReferencePriceInUsd } = useAppDataContext();
  const { gasLimit } = useModalContext();
  const repayTokens = user?.userReservesData
    .filter((userReserve) => userReserve.underlyingBalance !== '0')
    .map((userReserve) => ({
      address: userReserve.underlyingAsset,
      balance: userReserve.underlyingBalance,
      symbol: userReserve.reserve.symbol,
      iconSymbol: userReserve.reserve.iconSymbol,
      aToken: true,
    }));
  const [tokenToRepayWith, setTokenToRepayWith] = useState<RepayAsset>(repayTokens[0]);
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  const debt =
    debtType === InterestRate.Stable ? userReserve.stableBorrows : userReserve.variableBorrows;
  const safeAmountToRepayAll = valueToBigNumber(debt).multipliedBy('1.0025');

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? safeAmountToRepayAll.toString() : _amount;
  const usdValue = valueToBigNumber(amount).multipliedBy(poolReserve.priceInUSD);

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
        assets={repayTokens}
        onSelect={setTokenToRepayWith}
        isMaxSelected={isMaxSelected}
        maxValue={debt}
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
    </>
  );
}
