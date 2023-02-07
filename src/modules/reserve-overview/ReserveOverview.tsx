import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { AssetCapsProvider } from 'src/hooks/useAssetCaps';
import { ReserveActions } from 'src/modules/reserve-overview/ReserveActions';
import { ReserveConfiguration } from 'src/modules/reserve-overview/ReserveConfiguration';
import { ReserveTopDetails } from 'src/modules/reserve-overview/ReserveTopDetails';

interface ReserveOverviewProps {
  underlyingAsset: string;
}

export const ReserveOverview = ({ underlyingAsset }: ReserveOverviewProps) => {
  const { reserves } = useAppDataContext();
  const { breakpoints } = useTheme();
  const lg = useMediaQuery(breakpoints.up('lg'));

  const [mode, setMode] = useState<'overview' | 'actions' | ''>('');

  useEffect(() => {
    if (!mode) setMode('overview');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lg]);

  const reserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  const isOverview = mode === 'overview';

  return (
    <AssetCapsProvider asset={reserve}>
      <ReserveTopDetails underlyingAsset={underlyingAsset} />

      <ContentContainer>
        <Box
          sx={{
            display: { xs: 'flex', lg: 'none' },
            justifyContent: { xs: 'center', xsm: 'flex-start' },
            mb: { xs: 3, xsm: 4 },
          }}
        >
          <StyledToggleButtonGroup
            color="primary"
            value={mode}
            exclusive
            onChange={(_, value) => setMode(value)}
            sx={{ width: { xs: '100%', xsm: '359px' }, height: '44px' }}
          >
            <StyledToggleButton value="overview" disabled={mode === 'overview'}>
              <Typography variant="subheader1">
                <Trans>Overview</Trans>
              </Typography>
            </StyledToggleButton>
            <StyledToggleButton value="actions" disabled={mode === 'actions'}>
              <Typography variant="subheader1">
                <Trans>Your info</Trans>
              </Typography>
            </StyledToggleButton>
          </StyledToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex' }}>
          {/** Main status and configuration panel*/}
          <Box
            sx={{
              display: { xs: !isOverview ? 'none' : 'block', lg: 'block' },
              width: { xs: '100%', lg: 'calc(100% - 432px)' },
              mr: { xs: 0, lg: 4 },
            }}
          >
            {reserve && <ReserveConfiguration reserve={reserve} />}
          </Box>

          {/** Right panel with actions*/}
          <Box
            sx={{
              display: { xs: isOverview ? 'none' : 'block', lg: 'block' },
              width: { xs: '100%', lg: '416px' },
            }}
          >
            <ReserveActions reserve={reserve} />
          </Box>
        </Box>
      </ContentContainer>
    </AssetCapsProvider>
  );
};
