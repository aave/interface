import { Plural, Trans } from '@lingui/macro';
import { Box, Radio, RadioGroup, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { AssetIconStack } from 'src/components/AssetIconStack';
import { EModeIcon } from 'src/components/icons/EModeIcon';
import { flushPercentSx, FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ShowMoreButton } from 'src/components/ShowMoreButton';
import { amountBoxSx } from 'src/components/transactions/AssetInput';

import type { CollateralOption } from '../CollateralOptionsSelector';
import { CollateralOptionTag } from '../CollateralOptionTag';

const VISIBLE_COUNT = 3;
const ROW_PX = '1rem';
const RADIO_SIZE = '1.125rem';
const RADIO_GAP = '0.75rem';

const dividerSx = {
  '&::after': {
    content: '""',
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: `calc(${ROW_PX} + ${RADIO_SIZE} + ${RADIO_GAP})`,
    borderBottom: '1px solid',
    borderColor: 'border-0',
  },
};

const lineSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
};

const valueSx = (gap: string) => ({ display: 'flex', alignItems: 'baseline', gap, flexShrink: 0 });

interface OptionRowProps {
  option: CollateralOption;
  divider: boolean;
}

const OptionRow = ({ option, divider }: OptionRowProps) => {
  const row = (
    <Box
      component="label"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: RADIO_GAP,
        px: ROW_PX,
        py: '1rem',
        cursor: option.blocked ? 'not-allowed' : 'pointer',
        opacity: option.blocked ? 0.5 : 1,
        ...(option.blocked ? {} : { '&:hover': { bgcolor: 'button-hover' } }),
        ...(divider ? dividerSx : {}),
      }}
    >
      <Radio
        value={String(option.emodeId)}
        disabled={option.blocked}
        sx={{ p: 0, flexShrink: 0 }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={lineSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
            <Typography variant="h5" noWrap sx={{ minWidth: 0 }}>
              {option.emodeId === 0 ? <Trans>Default</Trans> : option.label}
            </Typography>
            {option.emodeId !== 0 && <EModeIcon />}
            {option.isCurrentEmode && <CollateralOptionTag kind="active" />}
            {option.isolated && <CollateralOptionTag kind="isolated" />}
          </Box>
          <Box sx={valueSx('0.25rem')}>
            <FormattedNumber
              value={option.ltv}
              percent
              visibleDecimals={0}
              variant="h5"
              sx={flushPercentSx}
            />
            <Typography variant="h5">
              <Trans>LTV</Trans>
            </Typography>
          </Box>
        </Box>
        <Box sx={{ ...lineSx, mt: '0.25rem', minHeight: '1.25rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <Typography variant="caption" color="fg-3">
              <Trans>Borrow</Trans>
            </Typography>
            <AssetIconStack assets={option.borrowableAssets} />
          </Box>
          <Box sx={valueSx('0.1875rem')}>
            <FormattedNumber
              value={option.penalty}
              percent
              visibleDecimals={2}
              variant="caption"
              color="fg-3"
              sx={flushPercentSx}
            />
            <Typography variant="caption" color="fg-3">
              <Trans>penalty</Trans>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return option.blocked ? (
    <Tooltip title={option.blockReason ?? ''} arrow placement="top">
      <Box>{row}</Box>
    </Tooltip>
  ) : (
    row
  );
};

interface CollateralOptionsListProps {
  options: CollateralOption[];
  selectedEmodeId: number;
  onSelect: (emodeId: number) => void;
}

export const CollateralOptionsList = ({
  options,
  selectedEmodeId,
  onSelect,
}: CollateralOptionsListProps) => {
  const [expanded, setExpanded] = useState(false);

  const collapsedOptions = options.filter(
    (option, index) => index < VISIBLE_COUNT || option.emodeId === selectedEmodeId
  );
  const hiddenOptions = options.filter((option) => !collapsedOptions.includes(option));
  const hiddenEmodeCount = hiddenOptions.filter((option) => option.emodeId !== 0).length;
  const hasToggle = hiddenOptions.length > 0;
  const visibleOptions = expanded ? options : collapsedOptions;

  return (
    <Box sx={amountBoxSx}>
      <RadioGroup
        value={String(selectedEmodeId)}
        onChange={(_, value) => onSelect(Number(value))}
        sx={{ flexWrap: 'nowrap' }}
      >
        {visibleOptions.map((option, index) => (
          <OptionRow
            key={option.emodeId}
            option={option}
            divider={hasToggle || index < visibleOptions.length - 1}
          />
        ))}
      </RadioGroup>
      {hasToggle && (
        <ShowMoreButton
          expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          label={
            hiddenEmodeCount > 0 ? (
              <Plural
                value={hiddenEmodeCount}
                one="Show # other E-Mode category"
                other="Show # other E-Mode categories"
              />
            ) : (
              <Trans>Show more</Trans>
            )
          }
          sx={{ '& .MuiSvgIcon-root': { mx: '0.0625rem' } }}
        />
      )}
    </Box>
  );
};
