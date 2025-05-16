import { OrderKind, QuoteAndPost, TradingSdk } from '@cowprotocol/cow-sdk';
import { BigNumber } from 'bignumber.js';
import { APP_CODE, isNativeToken } from 'src/components/transactions/Switch/cowprotocol.helpers';
import {
  isChainIdSupportedByCoWProtocol,
  WrappedNativeTokens,
} from 'src/components/transactions/Switch/switch.constants';
import { SwitchParams, SwitchRatesType } from 'src/components/transactions/Switch/switch.types';
import { getEthersProvider } from 'src/libs/web3-data-provider/adapters/EthersAdapter';
import { CoWProtocolPricesService } from 'src/services/CoWProtocolPricesService';
import { TxAction } from 'src/ui-config/errorMapping';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';

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
  const tradingSdk = new TradingSdk({ chainId });

  let orderBookQuote: QuoteAndPost | undefined;
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

    let destTokenWrapped = destToken;
    if (isNativeToken(destToken)) {
      destTokenWrapped = WrappedNativeTokens[chainId];
    }

    const provider = await getEthersProvider(wagmiConfig, { chainId });
    const signer = provider?.getSigner();

    [orderBookQuote, srcTokenPriceUsd, destTokenPriceUsd] = await Promise.all([
      tradingSdk
        .getQuote({
          owner: user as `0x${string}`,
          kind: OrderKind.SELL,
          amount,
          sellToken: srcTokenWrapped,
          sellTokenDecimals: srcDecimals,
          buyToken: destTokenWrapped,
          buyTokenDecimals: destDecimals,
          signer,
          appCode: APP_CODE,
        })
        .catch((cowError) => {
          throw new Error(cowError.body.errorType);
        }),
      // CoW Quote doesn't return values in USD, so we need to fetch the price from the API separately
      cowProtocolPricesService.getTokenUsdPrice(chainId, srcTokenWrapped).catch((cowError) => {
        throw new Error(cowError.body.errorType);
      }),
      cowProtocolPricesService.getTokenUsdPrice(chainId, destTokenWrapped).catch((cowError) => {
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
    BigNumber(
      orderBookQuote.quoteResults.amountsAndCosts.afterNetworkCosts.buyAmount.toString()
    ).dividedBy(10 ** destDecimals)
  );

  return {
    srcToken,
    srcUSD: srcAmountInUsd.toString(),
    srcAmount: amount,
    srcDecimals,
    destToken,
    destUSD: destAmountInUsd.toString(),
    destAmount: orderBookQuote.quoteResults.amountsAndCosts.afterNetworkCosts.buyAmount.toString(),
    destDecimals,
    provider: 'cowprotocol',
    order: orderBookQuote.quoteResults.orderToSign,
    quoteId: orderBookQuote.quoteResults.quoteResponse.id,
    suggestedSlippage: orderBookQuote.quoteResults.suggestedSlippageBps / 1000, // E.g. 100 -> 100 / 1000 = 0.1
  };
}
