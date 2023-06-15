import { InformationCircleIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Link, SvgIcon, Typography, TypographyProps } from '@mui/material';
import { ReactNode } from 'react';

import { ContentWithTooltip } from '../ContentWithTooltip';

const contentSx = {
  display: 'inline-flex',
  alignItems: 'center',
  p: '2px',
  mt: '2px',
  cursor: 'pointer',
  '&:hover': { opacity: 0.6 },
};

const InfoIcon = () => (
  <SvgIcon
    sx={{
      ml: '3px',
      color: 'text.muted',
      fontSize: '14px',
    }}
  >
    <InformationCircleIcon />
  </SvgIcon>
);
export const IsolatedEnabledBadge = ({
  typographyProps,
}: {
  typographyProps?: TypographyProps;
}) => {
  return (
    <ContentWithTooltip
      withoutHover
      tooltipContent={
        <IsolationModeTooltipTemplate
          content={
            <Trans>
              Isolated assets have limited borrowing power and other assets cannot be used as
              collateral.
            </Trans>
          }
        />
      }
    >
      <Box sx={contentSx}>
        <Typography variant="secondary12" color="text.secondary" {...typographyProps}>
          <Trans>Isolated</Trans>
        </Typography>
        <InfoIcon />
      </Box>
    </ContentWithTooltip>
  );
};

export const IsolatedDisabledBadge = () => {
  return (
    <ContentWithTooltip
      tooltipContent={
        <IsolationModeTooltipTemplate
          content={
            <Trans>
              Asset can be only used as collateral in isolation mode with limited borrowing power.
              To enter isolation mode, disable all other collateral.
            </Trans>
          }
        />
      }
    >
      <Box sx={contentSx}>
        <Typography variant="description" color="error.main">
          <Trans>Unavailable</Trans>
        </Typography>
        <InfoIcon />
      </Box>
    </ContentWithTooltip>
  );
};

export const UnavailableDueToIsolationBadge = () => {
  return (
    <ContentWithTooltip
      tooltipContent={
        <IsolationModeTooltipTemplate
          content={<Trans>Collateral usage is limited because of isolation mode.</Trans>}
        />
      }
    >
      <Box sx={contentSx}>
        <Typography variant="description" color="error.main">
          <Trans>Unavailable</Trans>
        </Typography>
        <InfoIcon />
      </Box>
    </ContentWithTooltip>
  );
};

const IsolationModeTooltipTemplate = ({ content }: { content: ReactNode }) => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>{content}</Box>
      <Typography variant="subheader2" color="text.secondary">
        <Trans>
          Learn more in our{' '}
          <Link href="https://docs.aave.com/faq/aave-v3-features#isolation-mode" fontWeight={500}>
            FAQ guide
          </Link>
        </Trans>
      </Typography>
    </Box>
  );
};
