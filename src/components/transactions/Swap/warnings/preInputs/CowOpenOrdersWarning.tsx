import { normalize } from '@aave/math-utils';
import { OrderStatus } from '@cowprotocol/cow-sdk';
import { Link, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Warning } from 'src/components/primitives/Warning';
import { useRootStore } from 'src/store/root';
import { findByChainId } from 'src/ui-config/marketsConfig';

import { getOrders } from '../../helpers/cow/orders.helpers';
import { SwapState } from '../../types';

export function CowOpenOrdersWarning({ state }: { state: SwapState }) {
  const user = useRootStore((store) => store.account);
  const [cowOpenOrdersTotalAmountFormatted, setCowOpenOrdersTotalAmountFormatted] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (
      state.provider == 'cowprotocol' &&
      user &&
      state.chainId &&
      state.sourceToken &&
      state.destinationToken
    ) {
      setCowOpenOrdersTotalAmountFormatted(undefined);

      getOrders(state.chainId, user).then((orders) => {
        const token = state.sourceToken.addressToSwap;

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
  }, [state.sourceToken, state.destinationToken, state.provider, state.chainId, user]);

  if (!cowOpenOrdersTotalAmountFormatted) return null;

  return (
    <Warning severity="info" icon={false} sx={{ mt: 2, mb: 2 }}>
      <Typography variant="caption">
        You have open orders for {cowOpenOrdersTotalAmountFormatted} {state.sourceToken.symbol}.{' '}
        <br /> Track them in your{' '}
        <Link target="_blank" href={`/history?marketName=${findByChainId(state.chainId)?.market}`}>
          transaction history
        </Link>
      </Typography>
    </Warning>
  );
}
