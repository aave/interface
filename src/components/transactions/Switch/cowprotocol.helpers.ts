import {
  CompetitionOrderStatus,
  OrderBookApi,
  OrderParameters,
  OrderSigningUtils,
  SigningScheme,
  UnsignedOrder,
} from '@cowprotocol/cow-sdk';
import { JsonRpcProvider } from '@ethersproject/providers';
import { getErrorTextFromError, TxAction, TxErrorType } from 'src/ui-config/errorMapping';

import { isChainIdSupportedByCoWProtocol } from './switch.constants';

export type CowProtocolActionParams = {
  quote: OrderParameters;
  provider: JsonRpcProvider;
  chainId: number;
  user: string;
  setError: (error: TxErrorType) => void;
  amount: string;
};

export const sendOrder = async ({
  quote,
  provider,
  chainId,
  user,
  setError,
  amount,
}: CowProtocolActionParams) => {
  //   Todo (Martin): build app data?
  const orderBookApi = new OrderBookApi({ chainId });
  const signer = provider?.getSigner();
  const order: UnsignedOrder = {
    ...quote,
    sellAmount: amount,
    receiver: user,
    feeAmount: '0', // Fee amount is deprecated
  };

  if (!isChainIdSupportedByCoWProtocol(chainId)) {
    setError(
      getErrorTextFromError(
        new Error('Chain not supported by CowProtocol'),
        TxAction.MAIN_ACTION,
        true
      )
    );
    return;
  }

  if (!signer) {
    setError(
      getErrorTextFromError(new Error('No signer found in provider'), TxAction.MAIN_ACTION, true)
    );
    return;
  }

  const orderSigningResult = await OrderSigningUtils.signOrder(order, chainId, signer);

  try {
    return await orderBookApi.sendOrder(
      {
        ...quote,
        ...orderSigningResult,
        from: user,
        signingScheme: orderSigningResult.signingScheme as unknown as SigningScheme,
        ...order,
        feeAmount: '0', // Fee amount is deprecated from 5.10.2
      },
      {
        chainId: Number(chainId),
      }
    );
  } catch (e) {
    setError(getErrorTextFromError(e, TxAction.MAIN_ACTION, true));
  }
};

export const getOrderStatus = async (orderId: string, chainId: number) => {
  const orderBookApi = new OrderBookApi({ chainId: 1 });
  const status = await orderBookApi.getOrderCompetitionStatus(orderId, {
    chainId,
  });
  return status.type;
};

export const getOrders = async (chainId: number, account: string) => {
  const orderBookApi = new OrderBookApi({ chainId });
  const orders = await orderBookApi.getOrders({
    owner: account,
  });

  return orders;
};

export const isOrderLoading = (status: CompetitionOrderStatus.type) => {
  return (
    status === CompetitionOrderStatus.type.OPEN ||
    status === CompetitionOrderStatus.type.SCHEDULED ||
    status === CompetitionOrderStatus.type.EXECUTING ||
    status === CompetitionOrderStatus.type.ACTIVE
  );
};

export const isOrderFilled = (status: CompetitionOrderStatus.type) => {
  return (
    status === CompetitionOrderStatus.type.SOLVED || status === CompetitionOrderStatus.type.TRADED
  );
};

export const isOrderCancelled = (status: CompetitionOrderStatus.type) => {
  return status === CompetitionOrderStatus.type.CANCELLED;
};
