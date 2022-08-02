import { Trans } from '@lingui/macro';
import { AssetCapData } from 'src/hooks/getAssetCapUsage';
import { Link } from '../../primitives/Link';
import { Warning } from '../../primitives/Warning';

type SupplyCapWarningProps = {
  supplyCap: AssetCapData;
};

export const SupplyCapWarning = ({ supplyCap }: SupplyCapWarningProps) => {
  return (
    <Warning severity="warning">
      <Trans>
        Maximum amount available to supply is limited because protocol supply cap is at{' '}
        {supplyCap.percentUsed.toFixed(2)}%.
      </Trans>
      <br />
      <Link href="https://docs.aave.com/developers/whats-new/supply-borrow-caps">
        <Trans>Learn more</Trans>
      </Link>
    </Warning>
  );
};
