import { LightningBoltIcon, CogIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, Typography } from '@mui/material';
import Menu from '@mui/material/Menu';
import React, { useEffect, useState } from 'react';

import LightningBoltGradient from '/public/lightningBoltGradient.svg';

import { Link } from '../../components/primitives/Link';
import { Row } from '../../components/primitives/Row';
import { TypographyGradient } from '../../components/primitives/TypographyGradient';
import { getEmodeMessage } from '../../components/transactions/Emode/EmodeNaming';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { EmodeModalType } from 'src/components/transactions/Emode/EmodeModalContent';

interface DashboardEModeButtonProps {
  userEmodeCategoryId: number;
  baseAssetSymbol: string;
  reserves: ComputedReserveData[];
}

export const DashboardEModeButton = ({
  userEmodeCategoryId,
  baseAssetSymbol,
  reserves,
}: DashboardEModeButtonProps) => {
  const { openEmode } = useModalContext();
  const iconButtonSize = 12;

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [reservesLength, setReservesLength] = useState(0);
  const [eModes, setEmodes] = useState<number[]>([]);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const isEModeDisabled = userEmodeCategoryId === 0;

  const EModeLabelMessage = () => (
    <Trans>{getEmodeMessage(userEmodeCategoryId, baseAssetSymbol)}</Trans>
  );

  useEffect(() => {
    if (reserves.length !== reservesLength) {
      console.log('UPDATING');
      const eModes: number[] = [];
      reserves.forEach((reserve: ComputedReserveData) => {
        if (eModes.indexOf(reserve.eModeCategoryId) === -1) {
          eModes.push(reserve.eModeCategoryId);
        }
      });
      setEmodes(eModes);
      setReservesLength(reserves.length);
    }
  }, [reservesLength, setReservesLength, reserves]);

  return (
    <Box
      sx={{ display: 'inline-flex', alignItems: 'center' }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Typography mr={1} variant="description" color="text.secondary">
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
        sx={(theme) => ({
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
            background: isEModeDisabled ? 'transparent' : theme.palette.gradients.aaveGradient,
            borderRadius: '4px',
          },
        })}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
            bgcolor: isEModeDisabled ? (open ? '#EAEBEF' : '#F7F7F9') : 'background.paper',
            px: 1.5,
            borderRadius: '4px',
          }}
        >
          <SvgIcon
            sx={{
              fontSize: iconButtonSize,
              mr: 1.5,
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

          <SvgIcon
            sx={{
              fontSize: iconButtonSize,
              ml: 1.5,
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
              <Typography mb={1} variant="caption" color="text.secondary">
                <Trans>Asset category</Trans>
              </Typography>

              <Box
                sx={(theme) => ({
                  p: 2,
                  mb: 3,
                  borderRadius: '6px',
                  border: `1px solid ${theme.palette.divider}`,
                })}
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
                      <Typography variant="subheader2" color="text.primary">
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

          <Typography variant="caption" color="text.secondary" mb={4}>
            <Trans>
              E-Mode increases your LTV for a selected category of assets up to 97%.{' '}
              <Link
                href="https://docs.aave.com/faq/aave-v3-features#high-efficiency-mode-e-mode"
                sx={{ textDecoration: 'underline' }}
                variant="caption"
                color="text.secondary"
              >
                Learn more
              </Link>
            </Trans>
          </Typography>

          {isEModeDisabled ? (
            <Button
              sx={{ width: '100%' }}
              variant={'gradient'}
              onClick={() => {
                openEmode(EmodeModalType.ENABLE);
                handleClose();
              }}
              data-cy={'emode-enable'}
            >
              <Trans>Enable E-Mode</Trans>
            </Button>
          ) : (
            <>
              {eModes.length > 2 && (
                <Button
                  sx={{ width: '100%', mb: '6px' }}
                  variant={'outlined'}
                  onClick={() => {
                    openEmode(EmodeModalType.SWITCH);
                    handleClose();
                  }}
                  data-cy={'emode-switch'}
                >
                  <Trans>Switch E-Mode category</Trans>
                </Button>
              )}
              <Button
                sx={{ width: '100%' }}
                variant={'outlined'}
                onClick={() => {
                  openEmode(EmodeModalType.DISABLE);
                  handleClose();
                }}
                data-cy={'emode-disable'}
              >
                <Trans>Disable E-Mode</Trans>
              </Button>
            </>
          )}
        </Box>
      </Menu>
    </Box>
  );
};
