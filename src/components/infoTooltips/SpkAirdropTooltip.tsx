import { Trans } from '@lingui/macro';

import { Link } from '../primitives/Link';
import { TextWithTooltip } from '../TextWithTooltip';

export const SpkAirdropTooltip = () => {
  return (
    <TextWithTooltip
      wrapperProps={{ ml: 2 }}
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
