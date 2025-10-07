import { normalize } from '@aave/math-utils';
import { OrderStatus } from '@cowprotocol/cow-sdk';
import { useEffect, useState } from 'react';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { ChangeNetworkWarning } from '../../Warnings/ChangeNetworkWarning';
import { getOrders } from '../helpers/cow/orders.helpers';
import { SwapParams, SwapState } from '../types';
import { CowOpenOrdersWarning } from './preInputs';

export const SwapPreInputWarnings = ({
  params,
  state,
}: {
  params: SwapParams;
  state: SwapState;
}) => {
  const isWrongNetwork = useIsWrongNetwork(state.chainId);
  const { readOnlyModeAddress } = useWeb3Context();
  const user = useRootStore((store) => store.account);

  const [cowOpenOrdersTotalAmountFormatted, setCowOpenOrdersTotalAmountFormatted] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (
      state.swapRate?.provider == 'cowprotocol' &&
      user &&
      state.chainId &&
      state.sourceToken &&
      state.destinationToken
    ) {
      setCowOpenOrdersTotalAmountFormatted(undefined);

      getOrders(state.chainId, user).then((orders) => {
        const token = state.sourceToken.addressToSwap; // TODO: Check

        if (!token) {
          return;
        }

        const cowOpenOrdersTotalAmount = orders
          .filter(
            (order) =>
              order.sellToken.toLowerCase() == token.toLowerCase() &&
              order.status == OrderStatus.OPEN
          )
          .map((order) => order.sellAmount)
          .reduce((acc, curr) => acc + Number(curr), 0);
        if (cowOpenOrdersTotalAmount > 0) {
          setCowOpenOrdersTotalAmountFormatted(
            normalize(cowOpenOrdersTotalAmount, state.sourceToken.decimals).toString()
          );
        } else {
          setCowOpenOrdersTotalAmountFormatted(undefined);
        }
      });
    } else {
      setCowOpenOrdersTotalAmountFormatted(undefined);
    }
  }, [
    state.sourceToken,
    state.destinationToken,
    state.swapRate?.provider,
    state.chainId,
    user,
    params.swapType,
  ]);

  return (
    <>
      {state.showChangeNetworkWarning && isWrongNetwork.isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          autoSwitchOnMount={true}
          networkName={getNetworkConfig(state.chainId).name}
          chainId={state.chainId}
          event={{
            eventName: GENERAL.SWITCH_NETWORK,
          }}
          askManualSwitch={state.userIsSmartContractWallet}
        />
      )}

      <CowOpenOrdersWarning
        state={state}
        cowOpenOrdersTotalAmountFormatted={cowOpenOrdersTotalAmountFormatted}
      />
    </>
  );
};
