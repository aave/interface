import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';

import { Link } from '../primitives/Link';

enum POINTS_INCENTIVES_TYPES {
  ETHENA = 'Ethena',
  SONIC = 'Sonic',
  ETHERFI = 'EtherFi',
}

const pointsIncentivesLink: Record<POINTS_INCENTIVES_TYPES, { link: string }> = {
  [POINTS_INCENTIVES_TYPES.ETHENA]: { link: 'https://app.ethena.fi/join' },
  [POINTS_INCENTIVES_TYPES.SONIC]: {
    link: 'https://blog.soniclabs.com/sonic-points-simplified-how-to-qualify-for-200-million-s-airdrop/',
  },
  [POINTS_INCENTIVES_TYPES.ETHERFI]: {
    link: 'https://etherfi.gitbook.io/etherfi/getting-started/loyalty-points',
  },
};

const getPointsIncentivesDescription = ({
  incentiveType,
  points,
}: {
  incentiveType: POINTS_INCENTIVES_TYPES;
  points: number;
}): string => {
  switch (incentiveType) {
    case POINTS_INCENTIVES_TYPES.ETHENA:
      return `This asset is eligible for ${points}x Ethena Rewards.`;
    case POINTS_INCENTIVES_TYPES.SONIC:
      return `This asset is eligible for ${points}x Sonic Rewards.`;
    case POINTS_INCENTIVES_TYPES.ETHERFI:
      return `This asset is eligible for the Ether.fi Loyalty program with a x${points} multiplier.`;
    default:
      return '';
  }
};

export const EthenaPointsTooltip = ({ points }: { points: number }) => (
  <PointsIncentivesTooltipContent type={POINTS_INCENTIVES_TYPES.ETHENA} points={points} />
);

export const SonicAirdropTooltipContent = ({ points }: { points: number }) => (
  <PointsIncentivesTooltipContent type={POINTS_INCENTIVES_TYPES.SONIC} points={points} />
);

export const EtherFiAirdropTooltipContent = ({ points }: { points: number }) => (
  <PointsIncentivesTooltipContent type={POINTS_INCENTIVES_TYPES.ETHERFI} points={points} />
);

export const PointsIncentivesTooltipContent = ({
  type,
  points,
}: {
  type: POINTS_INCENTIVES_TYPES;
  points: number;
}) => {
  return (
    <Box>
      <Trans>{`${getPointsIncentivesDescription({
        incentiveType: type,
        points,
      })}\n`}</Trans>
      <br />
      <Trans>{`Learn more about ${type} Rewards program`}</Trans>{' '}
      <Link
        href={pointsIncentivesLink[type].link}
        sx={{ textDecoration: 'underline' }}
        variant="caption"
        color="text.secondary"
      >
        {'here'}
      </Link>
      {'.'}
      <br />
      <br />
      <Trans>
        {`Aave Labs does not
          guarantee the program and accepts no liability.\n`}
      </Trans>
    </Box>
  );
};
