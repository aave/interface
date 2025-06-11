import { Trans } from '@lingui/macro';

import { Link } from '../primitives/Link';
import { TextWithTooltip } from '../TextWithTooltip';

export enum SIMPLE_EXTERNAL_INCENTIVES_TYPES {
  SUPERFEST = 'Superfest',
  SPARK = 'Spark',
  KERNEL = 'Kernel',
}

type Info = {
  text: string;
  link: string;
};

const pointsIncentivesLink: Record<
  SIMPLE_EXTERNAL_INCENTIVES_TYPES,
  { iconUrl: string; info1: Info; info2?: Info }
> = {
  [SIMPLE_EXTERNAL_INCENTIVES_TYPES.SUPERFEST]: {
    iconUrl: '/icons/other/superfest.svg',
    info1: {
      text: 'Learn more about Superfest',
      link: 'https://superfest.optimism.io',
    },
    info2: {
      text: 'Rewards can be claimed',
      link: 'https://jumper.exchange/superfest',
    },
  },
  [SIMPLE_EXTERNAL_INCENTIVES_TYPES.SPARK]: {
    iconUrl: '/icons/other/spark.svg',
    info1: {
      text: 'Learn more about the SPK rewards',
      link: 'https://forum.sky.money/t/spark-proposal-for-integrations-into-aave/25005',
    },
    info2: {
      text: 'and about SPK program',
      link: 'https://docs.spark.fi/rewards/spk-token#what-is-the-spk-pre-farming-airdrop',
    },
  },
  [SIMPLE_EXTERNAL_INCENTIVES_TYPES.KERNEL]: {
    iconUrl: '/icons/other/kernel.svg',
    info1: {
      text: 'Learn more about the Kernel points distribution',
      link: 'https://kerneldao.gitbook.io/kernel/getting-started/editor/kernel-points-guide',
    },
  },
};

export const SuperFestTooltip = () => (
  <SimpleExternalIncentiveTooltip type={SIMPLE_EXTERNAL_INCENTIVES_TYPES.SUPERFEST} />
);

export const SpkAirdropTooltip = () => (
  <SimpleExternalIncentiveTooltip type={SIMPLE_EXTERNAL_INCENTIVES_TYPES.SPARK} />
);

export const KernelAirdropTooltip = () => (
  <SimpleExternalIncentiveTooltip type={SIMPLE_EXTERNAL_INCENTIVES_TYPES.KERNEL} />
);

export const SimpleExternalIncentiveTooltip = ({
  type,
}: {
  type: SIMPLE_EXTERNAL_INCENTIVES_TYPES;
}) => {
  const config = pointsIncentivesLink[type];
  console.log('SimpleExternalIncentiveTooltip', type, config);
  return config ? (
    <TextWithTooltip
      wrapperProps={{ alignSelf: 'center' }}
      color="warning.main"
      iconSize={20}
      icon={<image href={config.iconUrl} width={25} height={25} />}
    >
      <>
        <Trans>
          {`This asset is eligible for rewards through ${type}.
            Aave Labs does not guarantee the program and accepts no liability.`}
        </Trans>
        <br />
        <br />
        <Trans>{config.info1.text}</Trans>{' '}
        <Link
          href={config.info1.link}
          sx={{ textDecoration: 'underline' }}
          variant="caption"
          color="text.secondary"
        >
          {'here'}
        </Link>
        {config.info2 ? (
          <>
            <br />
            <Trans>{config.info2.text}</Trans>{' '}
            <Link
              href={config.info2.link}
              sx={{ textDecoration: 'underline' }}
              variant="caption"
              color="text.secondary"
            >
              {' here'}
            </Link>
          </>
        ) : null}
      </>
    </TextWithTooltip>
  ) : null;
};
