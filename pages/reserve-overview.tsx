import { Trans } from '@lingui/macro';
import {
  Box,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import sx from '@mui/system/sx';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { MainLayout } from 'src/layouts/MainLayout';
import { ReserveActions } from 'src/modules/reserve-overview/ReserveActions';
import { ReserveConfiguration } from 'src/modules/reserve-overview/ReserveConfiguration';
import { ReserveTopDetails } from 'src/modules/reserve-overview/ReserveTopDetails';

import { ContentContainer } from '../src/components/ContentContainer';

const ToggleButtonInternal = styled(Box)(
  sx({
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 1px 0px rgba(0, 0, 0, 0.05)',
    borderRadius: '4px',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
  })
);

export default function ReserveOverview() {
  const router = useRouter();
  const { reserves } = useAppDataContext();
  const underlyingAsset = router.query.underlyingAsset as string;

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
    <>
      <ReserveTopDetails underlyingAsset={underlyingAsset} />

      <ContentContainer>
        <Box
          sx={{
            display: { xs: 'flex', lg: 'none' },
            justifyContent: { xs: 'center', xsm: 'flex-start' },
            mb: { xs: 3, xsm: 4 },
          }}
        >
          <ToggleButtonGroup
            color="primary"
            value={mode}
            exclusive
            onChange={(_, value) => setMode(value)}
            sx={{ width: { xs: '100%', xsm: '359px' }, height: '44px' }}
          >
            <ToggleButton value="overview" disabled={mode === 'overview'} sx={{ p: '4px' }}>
              {mode === 'overview' ? (
                <ToggleButtonInternal>
                  <Typography variant="subheader1Gradient" sx={{ alignSelf: 'center' }}>
                    <Trans>Overview</Trans>
                  </Typography>
                </ToggleButtonInternal>
              ) : (
                <Typography variant="subheader1">
                  <Trans>Overview</Trans>
                </Typography>
              )}
            </ToggleButton>
            <ToggleButton value="actions" disabled={mode === 'actions'} sx={{ p: '4px' }}>
              {mode === 'actions' ? (
                <ToggleButtonInternal>
                  <Typography variant="subheader1Gradient" sx={{ alignSelf: 'center' }}>
                    <Trans>Your info</Trans>
                  </Typography>
                </ToggleButtonInternal>
              ) : (
                <Typography variant="subheader1">
                  <Trans>Your info</Trans>
                </Typography>
              )}
            </ToggleButton>
          </ToggleButtonGroup>
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
            <ReserveActions underlyingAsset={underlyingAsset} />
          </Box>
        </Box>
      </ContentContainer>
    </>
  );
}

ReserveOverview.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
