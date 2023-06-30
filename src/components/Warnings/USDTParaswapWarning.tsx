import { Trans } from '@lingui/macro';

export const USDTParaswapWarning = () => {
  return (
    <Trans>
      Due to approval mechanics of USDT on Ethereum Mainnet, it cannot be used with the current
      adapter contract for this action.
    </Trans>
  );
};
