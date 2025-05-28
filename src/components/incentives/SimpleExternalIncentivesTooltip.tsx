import { Trans } from '@lingui/macro';

import { Link } from '../primitives/Link';
import { TextWithTooltip } from '../TextWithTooltip';

export const SuperFestTooltip = () => {
  return (
    <TextWithTooltip
      wrapperProps={{ alignSelf: 'center' }}
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

export const SpkAirdropTooltip = () => {
  return (
    <TextWithTooltip
      wrapperProps={{ alignSelf: 'center' }}
      color="warning.main"
      iconSize={20}
      icon={<image href="/icons/other/spark.svg" width={25} height={25} />}
    >
      <>
        <Trans>
          {`This asset is eligible for SPK incentive program. Aave Labs does not
          guarantee the program and accepts no liability.\n`}
        </Trans>
        <br />
        <br />
        <Trans>{'Learn more about the SPK rewards'}</Trans>{' '}
        <Link
          href="https://forum.sky.money/t/spark-proposal-for-integrations-into-aave/25005"
          sx={{ textDecoration: 'underline' }}
          variant="caption"
          color="text.secondary"
        >
          {'here'}
        </Link>{' '}
        <Trans>{'and about SPK program'}</Trans>{' '}
        <Link
          href="https://docs.spark.fi/rewards/spk-token#what-is-the-spk-pre-farming-airdrop"
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
