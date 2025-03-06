import { Trans } from '@lingui/macro';

import { Link } from '../primitives/Link';
import { TextWithTooltip } from '../TextWithTooltip';

export const KernelAirdropTooltip = () => {
  return (
    <TextWithTooltip
      wrapperProps={{ alignSelf: 'center' }}
      color="warning.main"
      iconSize={20}
      icon={<image href="/icons/other/kernel.svg" width={25} height={25} />}
    >
      <>
        <Trans>
          {`This asset is eligible for Kernel points incentive program. Aave Labs does not
          guarantee the program and accepts no liability.\n`}
        </Trans>
        <br />
        <br />
        <Trans>{'Learn more about the Kernel points distribution'}</Trans>{' '}
        <Link
          href="https://kerneldao.gitbook.io/kernel/getting-started/editor/kernel-points-guide "
          sx={{ textDecoration: 'underline' }}
          variant="caption"
          color="text.secondary"
        >
          {'here'}
        </Link>
        {'.'}
      </>
    </TextWithTooltip>
  );
};
