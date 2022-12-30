import { LightningBoltIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, Typography } from '@mui/material';
import React from 'react';
import { TypographyGradient } from 'src/components/primitives/TypographyGradient';
import { getEmodeMessage } from 'src/components/transactions/Emode/EmodeNaming';
import { selectEmodesV3 } from 'src/store/poolSelectors';
import { useRootStore } from 'src/store/root';

import LightningBoltGradient from '/public/lightningBoltGradient.svg';

interface EmodeInfoProps {
  userEmodeCategoryId: number;
}

export const EmodeInfo = ({ userEmodeCategoryId }: EmodeInfoProps) => {
  const eModesV3 = useRootStore(selectEmodesV3);
  const iconButtonSize = 12;

  const isEModeDisabled = userEmodeCategoryId === 0;

  const EModeLabelMessage = () => (
    <Trans>{getEmodeMessage(eModesV3[userEmodeCategoryId]?.label)}</Trans>
  );

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Typography mr={1} variant="description" color="text.secondary">
        <Trans>E-Mode</Trans>
      </Typography>

      <Button
        size="small"
        variant="outlined"
        sx={(theme) => ({
          ml: 1,
          borderRadius: '4px',
          p: 0,
          cursor: 'default',
          '&:hover': {
            borderColor: theme.palette.background.disabled,
          },
          '&:after': {
            content: "''",
            position: 'absolute',
            left: -1,
            right: -1,
            bottom: -1,
            top: -1,
            background: isEModeDisabled ? 'transparent' : theme.palette.gradients.aaveGradient,
            borderRadius: '4px',
          },
        })}
      >
        <Box
          sx={(theme) => ({
            display: 'inline-flex',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
            bgcolor: isEModeDisabled
              ? theme.palette.background.surface
              : theme.palette.background.paper,
            px: '4px',
            borderRadius: '4px',
          })}
        >
          <SvgIcon
            sx={{
              fontSize: iconButtonSize,
              mr: '4px',
              color: isEModeDisabled ? 'text.muted' : 'text.primary',
            }}
          >
            {isEModeDisabled ? <LightningBoltIcon /> : <LightningBoltGradient />}
          </SvgIcon>

          {isEModeDisabled ? (
            <Typography variant="buttonS" color="text.secondary">
              <EModeLabelMessage />
            </Typography>
          ) : (
            <TypographyGradient variant="buttonS">
              <EModeLabelMessage />
            </TypographyGradient>
          )}
        </Box>
      </Button>
    </Box>
  );
};
