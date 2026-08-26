import { CogIcon, LightningBoltIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, Typography } from '@mui/material';
import Menu from '@mui/material/Menu';
import React, { useState } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { DASHBOARD, GENERAL } from 'src/utils/events';
import { figVars } from 'src/utils/figmaColors';
import { replaceUnderscoresWithSpaces } from 'src/utils/utils';

import LightningBoltGradient from '/public/lightningBoltGradient.svg';

import { Link } from '../../components/primitives/Link';
import { Row } from '../../components/primitives/Row';
import { TypographyGradient } from '../../components/primitives/TypographyGradient';
import { getEmodeMessage } from '../../components/transactions/Emode/EmodeNaming';

interface DashboardEModeButtonProps {
  userEmodeCategoryId: number;
}

export const DashboardEModeButton = ({ userEmodeCategoryId }: DashboardEModeButtonProps) => {
  const { openEmode } = useModalContext();
  const { eModes: _eModes } = useAppDataContext();
  const trackEvent = useRootStore((store) => store.trackEvent);

  const iconButtonSize = 12;

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    trackEvent(DASHBOARD.E_MODE_INFO_DASHBOARD, { userEmodeCategoryId });

    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const isEModeDisabled = userEmodeCategoryId === 0;

  const EModeLabelMessage = () => (
    <Trans>
      {replaceUnderscoresWithSpaces(getEmodeMessage(_eModes[userEmodeCategoryId].label))}
    </Trans>
  );

  return (
    <Box
      sx={{ display: 'inline-flex', alignItems: 'center' }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Typography mr={1} variant="description" color="fg-2">
        <Trans>E-Mode</Trans>
      </Typography>

      <Button
        onClick={(e) => {
          e.stopPropagation();
          handleClick(e);
        }}
        data-cy={`emode-open`}
        size="small"
        variant="outlined"
        sx={{
          ml: 1,
          borderRadius: '4px',
          p: 0,
          '&:after': {
            content: "''",
            position: 'absolute',
            left: -1,
            right: -1,
            bottom: -1,
            top: -1,
            background: isEModeDisabled ? 'transparent' : figVars['purple-1'],
            borderRadius: '4px',
          },
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
            bgcolor: isEModeDisabled
              ? open
                ? figVars['bg-6']
                : 'transparent'
              : figVars['surface-elevated'],
            px: '4px',
            borderRadius: '4px',
            height: '100%',
          }}
        >
          <SvgIcon
            sx={{
              fontSize: iconButtonSize,
              mr: '4px',
              color: isEModeDisabled ? 'fg-3' : 'fg-1',
            }}
          >
            {isEModeDisabled ? <LightningBoltIcon /> : <LightningBoltGradient />}
          </SvgIcon>

          {isEModeDisabled ? (
            <Typography variant="buttonM" color="fg-2">
              <EModeLabelMessage />
            </Typography>
          ) : (
            <TypographyGradient variant="buttonM">
              <EModeLabelMessage />
            </TypographyGradient>
          )}

          <SvgIcon
            sx={{
              fontSize: iconButtonSize,
              ml: '4px',
              color: 'primary.light',
            }}
          >
            <CogIcon />
          </SvgIcon>
        </Box>
      </Button>

      <Menu
        open={open}
        anchorEl={anchorEl}
        sx={{ '.MuiMenu-paper': { maxWidth: '280px' } }}
        onClose={handleClose}
        keepMounted={true}
      >
        <Box sx={{ px: 4, pt: 2, pb: 3 }}>
          <Typography variant="subheader1" mb={isEModeDisabled ? 1 : 3}>
            <Trans>Efficiency mode (E-Mode)</Trans>
          </Typography>

          {!isEModeDisabled && (
            <Box>
              <Typography mb={1} variant="caption" color="fg-2">
                <Trans>Asset category</Trans>
              </Typography>

              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: '6px',
                  border: `1px solid ${figVars['border-2']}`,
                }}
              >
                <Row
                  caption={
                    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                      <SvgIcon
                        sx={{
                          fontSize: iconButtonSize,
                          mr: 1,
                        }}
                      >
                        <LightningBoltGradient />
                      </SvgIcon>
                      <Typography variant="subheader2" color="fg-1">
                        <EModeLabelMessage />
                      </Typography>
                    </Box>
                  }
                >
                  <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        boxShadow:
                          '0px 2px 1px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25)',
                        mr: '5px',
                      }}
                    />
                    <Typography variant="subheader2" color="success.main">
                      <Trans>Enabled</Trans>
                    </Typography>
                  </Box>
                </Row>
              </Box>
            </Box>
          )}

          <Typography variant="caption" color="fg-2" mb={4}>
            <Trans>
              E-Mode increases your LTV for a selected category of assets.{' '}
              <Link
                href="https://aave.com/help/borrowing/e-mode"
                sx={{ textDecoration: 'underline' }}
                variant="caption"
                color="fg-2"
              >
                Learn more
              </Link>
            </Trans>
          </Typography>

          {isEModeDisabled ? (
            <Button
              fullWidth
              variant="contained"
              size="small"
              onClick={() => {
                trackEvent(GENERAL.OPEN_MODAL, {
                  type: 'Enable E-Mode',
                  data: userEmodeCategoryId,
                });

                openEmode();
                handleClose();
              }}
              data-cy={'emode-enable'}
            >
              <Trans>Enable E-Mode</Trans>
            </Button>
          ) : (
            <>
              <Button
                fullWidth
                sx={{ mb: '6px' }}
                variant="tertiary"
                size="small"
                onClick={() => {
                  trackEvent(GENERAL.OPEN_MODAL, {
                    modal: 'Switch E-Mode',
                    data: userEmodeCategoryId,
                  });

                  openEmode();
                  handleClose();
                }}
                data-cy={'emode-switch'}
              >
                <Trans>Manage E-Mode</Trans>
              </Button>
            </>
          )}
        </Box>
      </Menu>
    </Box>
  );
};
