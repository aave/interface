import { Trans } from '@lingui/macro';

export const StETHCollateralWarning = () => {
  return (
    <Trans>
      Due to stETH contracts limitations stETH supply position cannot be swapped to another asset.
      Also, borrow positions cannot be repaid with stETH collateral.
    </Trans>
  );
};
