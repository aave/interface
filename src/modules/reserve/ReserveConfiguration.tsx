import React from 'react';
import { Trans } from '@lingui/macro';
import { Box, BoxProps, Divider, Typography, TypographyProps } from '@mui/material';
import Paper from '@mui/material/Paper';
import { TopInfoPanelItem } from 'src/components/TopInfoPanel/TopInfoPanelItem';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';

export const PanelRow: React.FC<BoxProps> = (props) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 4,
      flexWrap: 'wrap',
      mb: '24px',
      ...props.sx,
    }}
    {...props}
  />
);
export const PanelTitle: React.FC<TypographyProps> = (props) => (
  <Typography variant="subheader1" sx={{ width: { sm: '170px' } }} {...props} />
);

export const ReserveConfiguration = () => {
  const asCollateral = true;
  const eMode = true;
  return (
    <>
      <Paper sx={{ minHeight: '1000px', py: '16px', px: '24px' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexWrap: 'wrap',
            mb: '24px',
          }}
        >
          <Typography variant="h3">
            <Trans>Reserve status &#38; configuration</Trans>
          </Typography>
          {eMode && (
            <Typography
              color="text.secondary"
              variant="description"
              sx={{ display: 'inline-flex' }}
            >
              <Trans>E-Mode category</Trans>
              <Typography variant="subheader1" sx={{ ml: 2 }}>
                Stablecoin
              </Typography>
              <HelpOutlinedIcon fontSize="small" sx={{ color: 'divider', ml: 1 }} />
            </Typography>
          )}
        </Box>

        <PanelRow>
          <PanelTitle>Supply Info</PanelTitle>
          <div>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexWrap: 'wrap',
              }}
            >
              <TopInfoPanelItem title={<Trans>Total supplied</Trans>} hideIcon variant="light">
                <FormattedNumber value={'10000000'} symbol="USD" variant="main16" />
              </TopInfoPanelItem>
              <TopInfoPanelItem title={<Trans>APY</Trans>} hideIcon variant="light">
                <FormattedNumber value={0.012} percent variant="main16" />
              </TopInfoPanelItem>
              <TopInfoPanelItem title={<Trans>Supply cap</Trans>} hideIcon variant="light">
                <FormattedNumber value={'10000000'} symbol="USD" variant="main16" />
              </TopInfoPanelItem>
            </Box>

            {/** Place Supply Chart here */}

            <Paper
              sx={{
                mt: 4,
                py: '12px',
                px: '16px',
                background: 'background.surface',
              }}
            >
              <div>
                <Typography sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  <Trans>Can be used as collateral:</Trans>
                  {asCollateral ? (
                    <>
                      <CheckRoundedIcon fontSize="small" color="success" sx={{ ml: 2 }} />
                      <Trans>Yes</Trans>
                    </>
                  ) : (
                    <>
                      <CloseRoundedIcon fontSize="small" color="error" sx={{ ml: 2 }} />
                      <Trans>No</Trans>
                    </>
                  )}
                </Typography>
              </div>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 6,
                  flexWrap: 'wrap',
                  mt: '16px',
                }}
              >
                <Typography sx={{ display: 'inline-flex' }}>
                  <Trans>Max LTV</Trans>
                  <FormattedNumber value="0.75" percent variant="secondary14" sx={{ ml: 2 }} />
                </Typography>
                <Typography sx={{ display: 'inline-flex' }}>
                  <Trans>Liquidation threshold</Trans>
                  <FormattedNumber value="0.85" percent variant="secondary14" sx={{ ml: 2 }} />
                </Typography>
                <Typography sx={{ display: 'inline-flex' }}>
                  <Trans>Liquidation penalty</Trans>
                  <FormattedNumber value="0.05" percent variant="secondary14" sx={{ ml: 2 }} />
                </Typography>
              </Box>
            </Paper>
          </div>
        </PanelRow>

        <Divider sx={{ my: '40px' }} />

        <PanelRow>
          <PanelTitle>Borrow info</PanelTitle>
          <div>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 6,
                flexWrap: 'wrap',
              }}
            >
              <TopInfoPanelItem title={<Trans>Total borrowed</Trans>} hideIcon variant="light">
                <FormattedNumber value={'10000000'} symbol="USD" variant="main16" />
              </TopInfoPanelItem>
              <TopInfoPanelItem title={<Trans>APY variable</Trans>} hideIcon variant="light">
                <FormattedNumber value={0.012} percent variant="main16" />
              </TopInfoPanelItem>
              <TopInfoPanelItem title={<Trans>Borrow cap</Trans>} hideIcon variant="light">
                <FormattedNumber value={'10000000'} symbol="USD" variant="main16" />
              </TopInfoPanelItem>
            </Box>
          </div>
        </PanelRow>

        <Divider sx={{ my: '40px' }} />

        <PanelRow>
          <PanelTitle>Interest rate model</PanelTitle>
          <div />
        </PanelRow>
      </Paper>
    </>
  );
};
