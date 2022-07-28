import { Trans } from '@lingui/macro';
import { Link } from '../../primitives/Link';
import { Warning } from '../../primitives/Warning';

type SupplyCapWarningProps = {
  supplyCapUsage: number;
};

export const SupplyCapWarning = ({ supplyCapUsage }: SupplyCapWarningProps) => {
  return (
    <Warning severity="warning">
      <Trans>
        Maximum amount available to supply is limited because protocol supply cap is at{' '}
        {supplyCapUsage.toFixed(2)}%.
      </Trans>{' '}
      <Link href="https://docs.aave.com/developers/whats-new/supply-borrow-caps">
        <Trans>Learn more</Trans>
      </Link>
    </Warning>
  );
};
