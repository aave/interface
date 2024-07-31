import { Trans } from '@lingui/macro';

import { Link } from '../primitives/Link';
import { TextWithTooltip } from '../TextWithTooltip';

export const SuperFestTooltip = () => {
  return (
    <TextWithTooltip
      wrapperProps={{ ml: 2 }}
      color="warning.main"
      iconSize={20}
      icon={<image href="/icons/other/superfest.svg" width={25} height={25} />}
    >
      <>
        <Trans>
          This asset is eligible for rewards through SuperFest. Aave Labs does not guarantee the
          program and accepts no liability.
        </Trans>{' '}
        <Link
          href="https://superfest.optimism.io"
          sx={{ textDecoration: 'underline' }}
          variant="caption"
          color="text.secondary"
        >
          Learn more
        </Link>{' '}
        <Trans>about SuperFest.</Trans>
        <br />
        <br />
        <Trans>Rewards can be claimed through</Trans>{' '}
        <Link
          href="https://jumper.exchange/superfest"
          sx={{ textDecoration: 'underline' }}
          variant="caption"
          color="text.secondary"
        >
          jumper.exchange
        </Link>
      </>
    </TextWithTooltip>
  );
};
