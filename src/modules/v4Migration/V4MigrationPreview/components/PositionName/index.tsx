import { t } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { HubMarketIcon } from 'src/components/HubMarketIcon';
import { ChevronUpDownIcon } from 'src/components/icons/ChevronUpDownIcon';
import { TitleWithSubtitle } from 'src/components/TitleWithSubtitle';

import { hubTitle } from '../../../utils/copy';
import { getHubDisplayName, getMarketDisplayName } from '../../../V4MigrationPage/utils/positions';

const NAME_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.375rem',
  minWidth: 0,
} as const;

const BUTTON_SX = { pl: '0.625rem', pr: '0.3125rem', gap: '0.125rem' } as const;

const CHEVRON_SX = { fontSize: '1rem', color: 'fg-chevron' } as const;

export const PositionName = ({
  hubName,
  marketName,
  onClick,
}: {
  hubName: string;
  marketName?: string;
  onClick?: () => void;
}) => {
  const hub = getHubDisplayName(hubName);
  const market = marketName ? getMarketDisplayName(marketName) : undefined;
  const name = (
    <Box component="span" sx={NAME_SX}>
      <HubMarketIcon kind={market ? 'market' : 'hub'} size={16} tone="grey" />
      {market ? (
        <TitleWithSubtitle title={market} subtitle={hub} />
      ) : (
        <TitleWithSubtitle title={hubTitle(hub)} />
      )}
    </Box>
  );

  if (!onClick) return name;

  return (
    <Button
      variant="tertiary"
      size="small"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label={market ? t`Change market (${market} Market)` : t`Change hub (${hub} Hub)`}
      sx={BUTTON_SX}
    >
      {name}
      <ChevronUpDownIcon sx={CHEVRON_SX} />
    </Button>
  );
};
