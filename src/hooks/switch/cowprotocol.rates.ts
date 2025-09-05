import { ChainId } from '@aave/contract-helpers';
import {
  OrderKind,
  QuoteAndPost,
  TradingSdk,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/cow-sdk';
import { BigNumber } from 'bignumber.js';
import {
  COW_PARTNER_FEE,
  HEADER_WIDGET_APP_CODE,
  isNativeToken,
} from 'src/components/transactions/Switch/cowprotocol/cowprotocol.helpers';
import { isChainIdSupportedByCoWProtocol } from 'src/components/transactions/Switch/switch.constants';
import {
  ProviderRatesParams,
  SwitchRatesType,
} from 'src/components/transactions/Switch/switch.types';
import { getEthersProvider } from 'src/libs/web3-data-provider/adapters/EthersAdapter';
import { CoWProtocolPricesService } from 'src/services/CoWProtocolPricesService';
import { FamilyPricesService } from 'src/services/FamilyPricesService';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

const getTokenUsdPrice = async (
  chainId: number,
  tokenAddress: string,
  isTokenCustom: boolean,
  isMainnet: boolean
) => {
  const cowProtocolPricesService = new CoWProtocolPricesService();
  const familyPricesService = new FamilyPricesService();

  try {
    let price;

    if (!isTokenCustom && isMainnet) {
      price = await familyPricesService.getTokenUsdPrice(chainId, tokenAddress);
    }

    if (price) {
      return price;
    }

    return await cowProtocolPricesService.getTokenUsdPrice(chainId, tokenAddress);
  } catch (familyError) {
    console.error(familyError);
    return undefined;
  }
};

export async function getCowProtocolSellRates({
  chainId,
  amount,
  srcToken,
  srcDecimals,
  destToken,
  destDecimals,
  user,
  inputSymbol,
  outputSymbol,
  setError,
  isInputTokenCustom,
  isOutputTokenCustom,
}: ProviderRatesParams): Promise<SwitchRatesType> {
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
      srcTokenWrapped = WRAPPED_NATIVE_CURRENCIES[chainId].address;
    }

    let destTokenWrapped = destToken;
    if (isNativeToken(destToken)) {
      destTokenWrapped = WRAPPED_NATIVE_CURRENCIES[chainId].address;
    }

    const provider = await getEthersProvider(wagmiConfig, { chainId });
    const signer = provider?.getSigner();
    const isMainnet =
      !getNetworkConfig(chainId as unknown as ChainId).isTestnet &&
      !getNetworkConfig(chainId as unknown as ChainId).isFork;

    if (!inputSymbol || !outputSymbol) {
      throw new Error('No input or output symbol provided');
    }

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
          appCode: HEADER_WIDGET_APP_CODE, // todo: use ADAPTER_APP_CODE for contract adapters
          partnerFee: COW_PARTNER_FEE(inputSymbol, outputSymbol),
        })
        .catch((cowError) => {
          console.error(cowError);
          throw new Error(cowError?.body?.errorType);
        }),
      getTokenUsdPrice(chainId, srcTokenWrapped, isInputTokenCustom ?? false, isMainnet),
      getTokenUsdPrice(chainId, destTokenWrapped, isOutputTokenCustom ?? false, isMainnet),
    ]);

    if (!srcTokenPriceUsd || !destTokenPriceUsd) {
      console.error('No price found for token');
      const error = getErrorTextFromError(
        new Error('No price found for token, please try another token'),
        TxAction.MAIN_ACTION,
        true
      );
      setError?.(error);
      console.error(error);
      throw new Error('No price found for token, please try another token');
    }
  } catch (error) {
    console.error('generate error', error);
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
      orderBookQuote.quoteResults.amountsAndCosts.afterPartnerFees.buyAmount.toString()
    ).dividedBy(10 ** destDecimals)
  );

  const destSpotInUsd = BigNumber(destTokenPriceUsd)
    .multipliedBy(
      BigNumber(orderBookQuote.quoteResults.amountsAndCosts.beforeNetworkCosts.buyAmount.toString())
    )
    .dividedBy(10 ** destDecimals);

  if (!orderBookQuote.quoteResults.suggestedSlippageBps) {
    console.error('No suggested slippage found');
    const error = getErrorTextFromError(
      new Error('No suggested slippage found'),
      TxAction.MAIN_ACTION,
      true
    );
    setError?.(error);
    console.error(error);
    throw new Error('No suggested slippage found');
  }

  if (!orderBookQuote.quoteResults.amountsAndCosts.afterPartnerFees.buyAmount) {
    console.error('No buy amount found');
    const error = getErrorTextFromError(
      new Error('No buy amount found'),
      TxAction.MAIN_ACTION,
      true
    );
    setError?.(error);
    console.error(error);
    throw new Error('No buy amount found');
  }

  let suggestedSlippage = (orderBookQuote.quoteResults.suggestedSlippageBps ?? 100) / 100; // E.g. 100 bps -> 1% 100 / 100 = 1

  if (isNativeToken(srcToken)) {
    // Recommended by CoW for potential reimbursments
    if (chainId == 1 && suggestedSlippage < 2) {
      suggestedSlippage = 2;
    } else if (chainId != 1 && suggestedSlippage < 0.5) {
      suggestedSlippage = 0.5;
    }
  }

  return {
    srcToken,
    srcUSD: srcAmountInUsd.toString(),
    srcAmount: amount,
    srcDecimals,
    destToken,
    destSpot: orderBookQuote.quoteResults.amountsAndCosts.beforeNetworkCosts.buyAmount.toString(),
    destSpotInUsd: destSpotInUsd.toString(),
    destUSD: destAmountInUsd.toString(),
    destAmount: orderBookQuote.quoteResults.amountsAndCosts.afterPartnerFees.buyAmount.toString(),
    destDecimals,
    orderBookQuote,
    provider: 'cowprotocol',
    order: orderBookQuote.quoteResults.orderToSign,
    quoteId: orderBookQuote.quoteResults.quoteResponse.id,
    suggestedSlippage,
    amountAndCosts: orderBookQuote.quoteResults.amountsAndCosts,
    srcTokenPriceUsd: Number(srcTokenPriceUsd),
    destTokenPriceUsd: Number(destTokenPriceUsd),
  };
}
