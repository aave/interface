import { OrderBookApi, OrderQuoteResponse, OrderQuoteSideKindSell } from '@cowprotocol/cow-sdk';
import { BigNumber } from 'bignumber.js';
import { isNativeToken } from 'src/components/transactions/Switch/cowprotocol.helpers';
import {
  isChainIdSupportedByCoWProtocol,
  WrappedNativeTokens,
} from 'src/components/transactions/Switch/switch.constants';
import { SwitchParams, SwitchRatesType } from 'src/components/transactions/Switch/switch.types';
import { CoWProtocolPricesService } from 'src/services/CoWProtocolPricesService';
import { TxAction } from 'src/ui-config/errorMapping';

export async function getCowProtocolSellRates({
  chainId,
  amount,
  srcToken,
  srcDecimals,
  destToken,
  destDecimals,
  user,
  setError,
}: SwitchParams): Promise<SwitchRatesType> {
  const cowProtocolPricesService = new CoWProtocolPricesService();
  const orderBookApi = new OrderBookApi({ chainId });

  let orderBookQuote: OrderQuoteResponse | undefined;
  let srcTokenPriceUsd: string | undefined;
  let destTokenPriceUsd: string | undefined;
  try {
    if (!isChainIdSupportedByCoWProtocol(chainId)) {
      throw new Error('Chain not supported by CowProtocol');
    }

    // If srcToken is native, we need to use the wrapped token for the quote
    let srcTokenWrapped = srcToken;
    if (isNativeToken(srcToken)) {
      srcTokenWrapped = WrappedNativeTokens[chainId];
    }

    [orderBookQuote, srcTokenPriceUsd, destTokenPriceUsd] = await Promise.all([
      orderBookApi
        .getQuote(
          {
            sellToken: srcTokenWrapped,
            buyToken: destToken,
            from: user,
            receiver: user,
            sellAmountBeforeFee: amount, // decimals?
            kind: OrderQuoteSideKindSell.SELL,
          },
          {
            chainId: chainId,
          }
        )
        .catch((cowError) => {
          throw new Error(cowError.body.errorType);
        }),
      // CoW Quote doesn't return values in USD, so we need to fetch the price from the API separately
      cowProtocolPricesService.getTokenUsdPrice(chainId, srcTokenWrapped).catch((cowError) => {
        throw new Error(cowError.body.errorType);
      }),
      cowProtocolPricesService.getTokenUsdPrice(chainId, destToken).catch((cowError) => {
        throw new Error(cowError.body.errorType);
      }),
    ]);

    if (!srcTokenPriceUsd || !destTokenPriceUsd) {
      throw new Error('No price found for token');
    }
  } catch (error) {
    setError?.({
      error: error,
      blocking: true,
      actionBlocked: true,
      rawError: error,
      txAction: TxAction.MAIN_ACTION,
    });

    throw error;
  }

  const srcAmountInUsd = BigNumber(srcTokenPriceUsd).multipliedBy(
    BigNumber(amount).dividedBy(10 ** srcDecimals)
  );
  const destAmountInUsd = BigNumber(destTokenPriceUsd).multipliedBy(
    BigNumber(orderBookQuote.quote.buyAmount).dividedBy(10 ** destDecimals)
  );

  return {
    srcToken,
    srcUSD: srcAmountInUsd.toString(),
    srcAmount: amount,
    srcDecimals,
    destToken,
    destUSD: destAmountInUsd.toString(),
    destAmount: orderBookQuote.quote.buyAmount,
    destDecimals,
    provider: 'cowprotocol',
    order: orderBookQuote.quote,
    quoteId: orderBookQuote.id,
  };
}
