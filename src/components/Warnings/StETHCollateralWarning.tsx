import { Trans } from '@lingui/macro';

export const StETHCollateralWarning = () => {
  return (
    <Trans>
      Due to internal stETH mechanics required for rebasing support, it is not possible to perform a
      collateral swap where stETH is the source token.
    </Trans>
  );
};
